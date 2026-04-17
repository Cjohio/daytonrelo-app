import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TouchableWithoutFeedback,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, RefreshControl, ScrollView, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../shared/theme/colors";
import { useAuth } from "../../shared/auth/AuthContext";
import { supabase } from "../../lib/supabase";
import BrandHeader from "../../shared/components/BrandHeader";
import { PostRowSkeleton } from "../../shared/components/SkeletonLoader";

// ─── Constants ────────────────────────────────────────────────────────────────
const CHRIS_EMAIL = "chris@cjohio.com";

const CATEGORIES = [
  { key: "general",       label: "General",     icon: "chatbubbles"   },
  { key: "pcs",           label: "PCS",         icon: "airplane"      },
  { key: "neighborhoods", label: "Areas",       icon: "map"           },
  { key: "schools",       label: "Schools",     icon: "school"        },
  { key: "events",        label: "Events",      icon: "calendar"      },
  { key: "restaurants",   label: "Restaurants", icon: "restaurant"    },
  { key: "feedback",      label: "Feedback",    icon: "thumbs-up"     },
] as const;

type CategoryKey = typeof CATEGORIES[number]["key"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Post {
  id:            string;
  user_id:       string;
  display_name:  string;
  category:      string;
  title:         string;
  body:          string;
  is_pinned:     boolean;
  upvote_count:  number;
  reply_count:   number;
  created_at:    string;
}

interface Reply {
  id:           string;
  post_id:      string;
  user_id:      string;
  display_name: string;
  body:         string;
  created_at:   string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const insets      = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("general");
  const [posts,          setPosts]          = useState<Post[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [myUpvotes,      setMyUpvotes]      = useState<Set<string>>(new Set());

  // Modals
  const [showNewPost,    setShowNewPost]    = useState(false);
  const [selectedPost,   setSelectedPost]  = useState<Post | null>(null);
  const [showUsername,   setShowUsername]  = useState(false);

  const isChris = profile?.email === CHRIS_EMAIL;
  const displayName = profile?.community_display_name || profile?.full_name || "User";

  // ── Check username on first visit ─────────────────────────────────────────
  useEffect(() => {
    if (profile && !profile.community_display_name) {
      setShowUsername(true);
    }
  }, [profile]);

  // ── Fetch posts ───────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("category", activeCategory)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) setPosts(data as Post[]);

    if (refresh) setRefreshing(false);
    else setLoading(false);
  }, [activeCategory]);

  // ── Fetch user's upvotes ──────────────────────────────────────────────────
  const fetchMyUpvotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("post_upvotes")
      .select("post_id")
      .eq("user_id", user.id);
    if (data) setMyUpvotes(new Set(data.map((r: any) => r.post_id)));
  }, [user]);

  useEffect(() => {
    fetchPosts();
    fetchMyUpvotes();
  }, [fetchPosts, fetchMyUpvotes]);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("community_posts_changes")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "community_posts",
        filter: `category=eq.${activeCategory}`,
      }, () => fetchPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeCategory, fetchPosts]);

  // ── Post options (long-press or trash icon) ───────────────────────────────
  const handleLongPress = (post: Post) => {
    if (!user) return; // must be logged in to see options
    const canDelete = isChris || post.user_id === user.id;
    const isOwnPost = post.user_id === user.id;

    const buttons: any[] = [{ text: "Cancel", style: "cancel" }];

    if (canDelete) {
      buttons.push({
        text: "Delete Post",
        style: "destructive",
        onPress: async () => {
          await supabase.from("community_posts").delete().eq("id", post.id);
          setPosts(prev => prev.filter(p => p.id !== post.id));
        },
      });
    }

    if (!isOwnPost) {
      buttons.push({
        text: "Report Post",
        onPress: () => {
          // Log the report to Supabase (best-effort) and acknowledge to user
          supabase.from("reported_posts").insert({
            post_id:     post.id,
            reported_by: user.id,
            reason:      "user_report",
            created_at:  new Date().toISOString(),
          }).then(() => {
            Alert.alert(
              "Post Reported",
              "Thanks for flagging this. We'll review it and take action if needed.",
              [{ text: "OK" }]
            );
          });
        },
      });
    }

    Alert.alert("Post Options", undefined, buttons);
  };

  // ── Upvote toggle ─────────────────────────────────────────────────────────
  const handleUpvote = async (post: Post) => {
    if (!user) return;
    const hasUpvoted = myUpvotes.has(post.id);

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, upvote_count: hasUpvoted ? p.upvote_count - 1 : p.upvote_count + 1 }
        : p
    ));
    setMyUpvotes(prev => {
      const next = new Set(prev);
      hasUpvoted ? next.delete(post.id) : next.add(post.id);
      return next;
    });

    if (hasUpvoted) {
      await supabase.from("post_upvotes")
        .delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("post_upvotes")
        .insert({ post_id: post.id, user_id: user.id });
    }
  };

  // ── Render post card ──────────────────────────────────────────────────────
  const renderPost = ({ item }: { item: Post }) => {
    const hasUpvoted    = myUpvotes.has(item.id);
    const isFeedback    = activeCategory === "feedback";
    const canDelete     = isChris || item.user_id === user?.id;
    const isChrisPost   = item.display_name?.toLowerCase().includes("chris");

    return (
      <TouchableOpacity
        style={[styles.postCard, item.is_pinned && styles.pinnedCard]}
        onPress={() => setSelectedPost(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.85}
      >
        {item.is_pinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={11} color={Colors.gold} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}

        <View style={styles.postHeader}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.display_name?.[0]?.toUpperCase() || "?"}</Text>
            </View>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{item.display_name}</Text>
                {item.display_name === displayName && item.user_id !== user?.id ? null :
                  item.display_name === (profile?.community_display_name || profile?.full_name) ? null : null}
                {/* Chris badge */}
                {item.user_id && profile?.email === CHRIS_EMAIL && item.user_id === user?.id && (
                  <View style={styles.chrisBadge}>
                    <Text style={styles.chrisBadgeText}>✓ Chris</Text>
                  </View>
                )}
              </View>
              <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
            </View>
          </View>

          {user && (
            <TouchableOpacity onPress={() => handleLongPress(item)} style={styles.deleteBtn}>
              <Ionicons
                name={canDelete ? "trash-outline" : "ellipsis-horizontal"}
                size={16}
                color={Colors.grayLight}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postBody} numberOfLines={3}>{item.body}</Text>

        <View style={styles.postFooter}>
          {isFeedback ? (
            <TouchableOpacity
              style={[styles.upvoteBtn, hasUpvoted && styles.upvoteBtnActive]}
              onPress={() => handleUpvote(item)}
            >
              <Ionicons
                name={hasUpvoted ? "thumbs-up" : "thumbs-up-outline"}
                size={15}
                color={hasUpvoted ? Colors.gold : Colors.gray}
              />
              <Text style={[styles.upvoteCount, hasUpvoted && styles.upvoteCountActive]}>
                {item.upvote_count} {item.upvote_count === 1 ? "vote" : "votes"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.repliesRow}>
              <Ionicons name="chatbubble-outline" size={14} color={Colors.gray} />
              <Text style={styles.repliesCount}>
                {item.reply_count} {item.reply_count === 1 ? "reply" : "replies"}
              </Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color={Colors.grayLight} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BrandHeader
        noTopInset
        right={user ? (
          <TouchableOpacity
            style={styles.editNameBtn}
            onPress={() => setShowUsername(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="person-circle-outline" size={22} color={Colors.gold} />
          </TouchableOpacity>
        ) : undefined}
      />

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScrollView}
        contentContainerStyle={styles.catContainer}
      >
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catTab, active && styles.catTabActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Ionicons
                name={(active ? cat.icon : `${cat.icon}-outline`) as any}
                size={15}
                color={active ? Colors.white : Colors.gray}
              />
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Category description */}
      <CategoryDescription category={activeCategory} />

      {/* Posts list */}
      {loading ? (
        <View style={{ flex: 1 }}>
          {[1, 2, 3, 4].map((i) => <PostRowSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPosts(true)}
              tintColor={Colors.gold}
            />
          }
          ListEmptyComponent={<EmptyState category={activeCategory} />}
        />
      )}

      {/* FAB — new post */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => setShowNewPost(true)}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Modals */}
      <UsernameModal
        visible={showUsername}
        currentName={profile?.community_display_name || profile?.full_name || ""}
        onSave={async (name) => {
          if (!user) return;
          await supabase.from("profiles")
            .update({ community_display_name: name })
            .eq("id", user.id);
          setShowUsername(false);
        }}
        onClose={() => setShowUsername(false)}
      />

      <NewPostModal
        visible={showNewPost}
        category={activeCategory}
        displayName={displayName}
        userId={user?.id || ""}
        onClose={() => setShowNewPost(false)}
        onPosted={() => { setShowNewPost(false); fetchPosts(); }}
      />

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          userId={user?.id || ""}
          displayName={displayName}
          isChris={isChris}
          hasUpvoted={myUpvotes.has(selectedPost.id)}
          onUpvote={() => handleUpvote(selectedPost)}
          onDelete={() => {
            handleLongPress(selectedPost);
          }}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </View>
  );
}

// ─── Category Description ──────────────────────────────────────────────────────
function CategoryDescription({ category }: { category: CategoryKey }) {
  const DESCRIPTIONS: Record<CategoryKey, string> = {
    general:       "General Dayton conversation — anything goes.",
    pcs:           "PCS orders, WPAFB housing, base tips & timelines.",
    neighborhoods: "Ask about specific areas, commute times, what it's really like.",
    schools:       "School districts, ratings, sports programs & more.",
    events:        "Local events, things to do, weekend plans & hidden gems.",
    restaurants:   "Best spots to eat, new openings, neighborhood favorites.",
    feedback:      "Suggest features or improvements. Upvote ideas you agree with!",
  };
  return (
    <View style={styles.descBar}>
      <Text style={styles.descText}>{DESCRIPTIONS[category]}</Text>
    </View>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ category }: { category: CategoryKey }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={48} color={Colors.grayLight} />
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptyBody}>
        Be the first to start a conversation in this category.
      </Text>
    </View>
  );
}

// ─── Username Modal ────────────────────────────────────────────────────────────
function UsernameModal({ visible, currentName, onSave, onClose }: {
  visible: boolean;
  currentName: string;
  onSave: (name: string) => void;
  onClose?: () => void;
}) {
  const [name, setName] = useState(currentName);
  const isEditing = !!currentName;

  // Reset to current name every time the modal opens
  useEffect(() => {
    if (visible) setName(currentName);
  }, [visible, currentName]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.usernameCard}>
          <Text style={styles.modalTitle}>
            {isEditing ? "Change Display Name" : "Choose Your Display Name"}
          </Text>
          <Text style={styles.modalSubtitle}>
            This is how you'll appear in the community.
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Mike D., Sarah T."
            placeholderTextColor={Colors.grayLight}
            autoFocus
            maxLength={30}
          />
          <TouchableOpacity
            style={[styles.primaryBtn, !name.trim() && styles.btnDisabled]}
            onPress={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
          >
            <Text style={styles.primaryBtnText}>
              {isEditing ? "Save Name" : "Set Display Name"}
            </Text>
          </TouchableOpacity>
          {isEditing ? (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.skipLink}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => onSave(currentName || "User")}>
              <Text style={styles.skipLink}>Use my full name for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── New Post Modal ────────────────────────────────────────────────────────────
function NewPostModal({ visible, category, displayName, userId, onClose, onPosted }: {
  visible:     boolean;
  category:    CategoryKey;
  displayName: string;
  userId:      string;
  onClose:     () => void;
  onPosted:    () => void;
}) {
  const [title,     setTitle]     = useState("");
  const [body,      setBody]      = useState("");
  const [posting,   setPosting]   = useState(false);

  const isFeedback = category === "feedback";

  const reset = () => { setTitle(""); setBody(""); };

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("community_posts").insert({
      user_id:      userId,
      display_name: displayName,
      category,
      title:        title.trim(),
      body:         body.trim(),
    });
    setPosting(false);
    if (!error) { reset(); onPosted(); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetCard}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {isFeedback ? "Submit Feedback" : "New Post"}
            </Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Ionicons name="close" size={24} color={Colors.gray} />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>
            {isFeedback ? "Short summary of your idea" : "Title"}
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={isFeedback ? "e.g. Add favorite neighborhoods list" : "What's your question or topic?"}
            placeholderTextColor={Colors.grayLight}
            maxLength={100}
          />

          <Text style={styles.inputLabel}>
            {isFeedback ? "Tell us more" : "Details"}
          </Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={body}
            onChangeText={setBody}
            placeholder={isFeedback ? "Describe the feature or issue in more detail..." : "Share the full story or question..."}
            placeholderTextColor={Colors.grayLight}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={1000}
          />

          <Text style={styles.postingAs}>Posting as <Text style={styles.postingAsName}>{displayName}</Text></Text>

          <TouchableOpacity
            style={[styles.primaryBtn, (!title.trim() || !body.trim() || posting) && styles.btnDisabled]}
            onPress={handlePost}
            disabled={!title.trim() || !body.trim() || posting}
          >
            {posting
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <Text style={styles.primaryBtnText}>{isFeedback ? "Submit Idea" : "Post"}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Post Detail Modal ─────────────────────────────────────────────────────────
function PostDetailModal({ post, userId, displayName, isChris, hasUpvoted, onUpvote, onDelete, onClose }: {
  post:        Post;
  userId:      string;
  displayName: string;
  isChris:     boolean;
  hasUpvoted:  boolean;
  onUpvote:    () => void;
  onDelete:    () => void;
  onClose:     () => void;
}) {
  const [replies,   setReplies]   = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [posting,   setPosting]   = useState(false);
  const isFeedback = post.category === "feedback";

  const fetchReplies = useCallback(async () => {
    const { data } = await supabase
      .from("community_replies")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) setReplies(data as Reply[]);
    setLoading(false);
  }, [post.id]);

  useEffect(() => { fetchReplies(); }, [fetchReplies]);

  // Real-time replies
  useEffect(() => {
    const channel = supabase
      .channel(`replies_${post.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "community_replies",
        filter: `post_id=eq.${post.id}`,
      }, payload => {
        setReplies(prev => [...prev, payload.new as Reply]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [post.id]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setPosting(true);
    await supabase.from("community_replies").insert({
      post_id:      post.id,
      user_id:      userId,
      display_name: displayName,
      body:         replyText.trim(),
    });
    setReplyText("");
    setPosting(false);
  };

  const deleteReply = (reply: Reply) => {
    const canDelete = isChris || reply.user_id === userId;
    if (!canDelete) return;
    Alert.alert("Delete Reply", "Delete this reply?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await supabase.from("community_replies").delete().eq("id", reply.id);
          setReplies(prev => prev.filter(r => r.id !== reply.id));
        },
      },
    ]);
  };

  const canDeletePost = isChris || post.user_id === userId;

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.detailContainer, { zIndex: 999, elevation: 999 }]}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle} numberOfLines={1}>{post.title}</Text>
          {canDeletePost && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={80}
        >
          <FlatList
            data={replies}
            keyExtractor={r => r.id}
            ListHeaderComponent={() => (
              <View style={styles.detailPost}>
                {/* Author */}
                <View style={styles.authorRow}>
                  <View style={[styles.avatar, styles.avatarLg]}>
                    <Text style={styles.avatarTextLg}>{post.display_name?.[0]?.toUpperCase()}</Text>
                  </View>
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={styles.authorNameLg}>{post.display_name}</Text>
                      {post.user_id === userId && post.display_name !== "Chris" && null}
                    </View>
                    <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
                  </View>
                </View>

                <Text style={styles.detailTitle}>{post.title}</Text>
                <Text style={styles.detailBody}>{post.body}</Text>

                {/* Upvote (feedback only) */}
                {isFeedback && (
                  <TouchableOpacity
                    style={[styles.upvoteBtnLg, hasUpvoted && styles.upvoteBtnActive]}
                    onPress={onUpvote}
                  >
                    <Ionicons
                      name={hasUpvoted ? "thumbs-up" : "thumbs-up-outline"}
                      size={18}
                      color={hasUpvoted ? Colors.gold : Colors.gray}
                    />
                    <Text style={[styles.upvoteCountLg, hasUpvoted && styles.upvoteCountActive]}>
                      {post.upvote_count} {post.upvote_count === 1 ? "vote" : "votes"}
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.divider} />
                <Text style={styles.repliesHeader}>
                  {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onLongPress={() => deleteReply(item)}
                style={styles.replyCard}
                activeOpacity={0.9}
              >
                <View style={styles.authorRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.display_name?.[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.authorName}>{item.display_name}</Text>
                      {/* Chris badge on replies */}
                      {isChris && item.user_id === userId && (
                        <View style={styles.chrisBadge}>
                          <Text style={styles.chrisBadgeText}>✓ Chris</Text>
                        </View>
                      )}
                      {(isChris || item.user_id === userId) && (
                        <TouchableOpacity
                          onPress={() => deleteReply(item)}
                          style={{ marginLeft: "auto" }}
                        >
                          <Ionicons name="trash-outline" size={14} color={Colors.grayLight} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.replyBody}>{item.body}</Text>
                    <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={loading
              ? <ActivityIndicator color={Colors.gold} style={{ marginTop: 20 }} />
              : null
            }
            contentContainerStyle={{ paddingBottom: 120 }}
          />

          {/* Reply input */}
          <View style={styles.replyBar}>
            <TextInput
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Add a reply…"
              placeholderTextColor={Colors.grayLight}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!replyText.trim() || posting) && styles.sendBtnDisabled]}
              onPress={handleReply}
              disabled={!replyText.trim() || posting}
            >
              {posting
                ? <ActivityIndicator color={Colors.white} size="small" />
                : <Ionicons name="send" size={18} color={Colors.white} />
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.offWhite },
  centered:         { flex: 1, justifyContent: "center", alignItems: "center" },

  // Category tabs
  catScrollView:    { flexGrow: 0, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  catContainer:     { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: "row" },
  catTab:           { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7,
                      borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  catTabActive:     { backgroundColor: Colors.gold, borderColor: Colors.gold },
  catLabel:         { fontSize: 13, fontWeight: "600", color: Colors.gray },
  catLabelActive:   { color: Colors.white },

  // Description bar
  descBar:          { backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 8,
                      borderBottomWidth: 1, borderBottomColor: Colors.border },
  descText:         { fontSize: 12, color: Colors.gray, fontStyle: "italic" },

  // Post cards
  listContent:      { padding: 16, gap: 12 },
  postCard:         { backgroundColor: Colors.white, borderRadius: 14, padding: 16,
                      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  pinnedCard:       { borderLeftWidth: 3, borderLeftColor: Colors.gold },
  pinnedBadge:      { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  pinnedText:       { fontSize: 11, fontWeight: "700", color: Colors.gold, textTransform: "uppercase", letterSpacing: 0.5 },

  postHeader:       { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  authorRow:        { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  nameRow:          { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  avatar:           { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.goldMuted,
                      justifyContent: "center", alignItems: "center" },
  avatarLg:         { width: 44, height: 44, borderRadius: 22 },
  avatarText:       { fontSize: 14, fontWeight: "700", color: Colors.white },
  avatarTextLg:     { fontSize: 18, fontWeight: "700", color: Colors.white },
  authorName:       { fontSize: 13, fontWeight: "700", color: Colors.black },
  authorNameLg:     { fontSize: 15, fontWeight: "700", color: Colors.black },
  postTime:         { fontSize: 11, color: Colors.gray, marginTop: 2 },

  chrisBadge:       { backgroundColor: Colors.gold, paddingHorizontal: 7, paddingVertical: 2,
                      borderRadius: 10 },
  chrisBadgeText:   { fontSize: 10, fontWeight: "800", color: Colors.white },

  deleteBtn:        { padding: 4 },
  postTitle:        { fontSize: 15, fontWeight: "700", color: Colors.black, marginBottom: 6, lineHeight: 20 },
  postBody:         { fontSize: 14, color: Colors.gray, lineHeight: 20, marginBottom: 12 },

  postFooter:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  repliesRow:       { flexDirection: "row", alignItems: "center", gap: 5 },
  repliesCount:     { fontSize: 13, color: Colors.gray },

  // Upvote
  upvoteBtn:        { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12,
                      paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.surface,
                      borderWidth: 1, borderColor: Colors.border },
  upvoteBtnActive:  { backgroundColor: "#FDF6E3", borderColor: Colors.gold },
  upvoteCount:      { fontSize: 13, fontWeight: "600", color: Colors.gray },
  upvoteCountActive:{ color: Colors.gold },
  upvoteBtnLg:      { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16,
                      paddingVertical: 10, borderRadius: 24, backgroundColor: Colors.surface,
                      borderWidth: 1.5, borderColor: Colors.border, alignSelf: "flex-start", marginTop: 12 },
  upvoteCountLg:    { fontSize: 14, fontWeight: "700", color: Colors.gray },

  // Empty state
  emptyState:       { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle:       { fontSize: 18, fontWeight: "700", color: Colors.black, marginTop: 16, marginBottom: 8 },
  emptyBody:        { fontSize: 14, color: Colors.gray, textAlign: "center", lineHeight: 20 },

  // Edit-name button (header right slot)
  editNameBtn:      { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

  // FAB
  fab:              { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28,
                      backgroundColor: Colors.gold, justifyContent: "center", alignItems: "center",
                      shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },

  // Overlay + modals
  overlay:          { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center",
                      alignItems: "center", padding: 24 },
  usernameCard:     { backgroundColor: Colors.white, borderRadius: 20, padding: 24, width: "100%" },
  sheetCard:        { backgroundColor: Colors.white, borderRadius: 20, padding: 24, width: "100%",
                      maxHeight: "90%" },
  sheetHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sheetTitle:       { fontSize: 18, fontWeight: "700", color: Colors.black },

  modalTitle:       { fontSize: 20, fontWeight: "800", color: Colors.black, marginBottom: 8 },
  modalSubtitle:    { fontSize: 14, color: Colors.gray, marginBottom: 20, lineHeight: 20 },

  inputLabel:       { fontSize: 13, fontWeight: "600", color: Colors.black, marginBottom: 6, marginTop: 12 },
  input:            { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
                      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
                      fontSize: 15, color: Colors.black },
  inputMultiline:   { minHeight: 110, paddingTop: 12 },

  postingAs:        { fontSize: 12, color: Colors.gray, textAlign: "center", marginTop: 12, marginBottom: 4 },
  postingAsName:    { fontWeight: "700", color: Colors.gold },

  primaryBtn:       { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14,
                      alignItems: "center", marginTop: 16 },
  btnDisabled:      { opacity: 0.45 },
  primaryBtnText:   { color: Colors.white, fontSize: 16, fontWeight: "700" },
  skipLink:         { textAlign: "center", color: Colors.gray, marginTop: 14, fontSize: 13 },

  // Detail modal
  detailContainer:  { flex: 1, backgroundColor: Colors.offWhite },
  detailHeader:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
                      paddingVertical: 14, backgroundColor: Colors.white,
                      borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  backBtn:          { padding: 10 },
  detailHeaderTitle:{ flex: 1, fontSize: 16, fontWeight: "700", color: Colors.black },

  detailPost:       { padding: 20, backgroundColor: Colors.white,
                      borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailTitle:      { fontSize: 20, fontWeight: "800", color: Colors.black, marginTop: 14, marginBottom: 10 },
  detailBody:       { fontSize: 15, color: Colors.gray, lineHeight: 22 },

  divider:          { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  repliesHeader:    { fontSize: 13, fontWeight: "700", color: Colors.gray, textTransform: "uppercase",
                      letterSpacing: 0.5, marginBottom: 4 },

  replyCard:        { paddingHorizontal: 20, paddingVertical: 14,
                      borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white },
  replyBody:        { fontSize: 14, color: Colors.black, lineHeight: 20, marginTop: 4, marginBottom: 2 },

  // Reply input bar
  replyBar:         { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 12,
                      backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  replyInput:       { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
                      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10,
                      fontSize: 14, color: Colors.black, maxHeight: 100 },
  sendBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gold,
                      justifyContent: "center", alignItems: "center" },
  sendBtnDisabled:  { backgroundColor: Colors.grayLight },
});
