export type Role = 'STUDENT' | 'PROFESSOR' | 'MODERATOR' | 'EVENT_MANAGER' | 'ADMIN'
export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD'
export type VoteType = 'UPVOTE' | 'DOWNVOTE'

export interface UserSummary {
  id: string; username: string; fullName: string
  profilePictureUrl: string | null; role: Role
}

export interface UserProfile {
  id: string; username: string; fullName: string; email: string
  bio: string | null; course: string | null; semester: number | null
  age: number | null; neighborhood: string | null
  profilePictureUrl: string | null; bannerUrl: string | null; whatsappNumber: string | null
  currentSubjects: string[]; followersCount: number; followingCount: number
  postsCount: number; role: Role; isFollowing: boolean; createdAt: string
}

export interface Community {
  id: string; name: string; slug: string; description: string
  bannerUrl: string | null; iconUrl: string | null; isPrivate: boolean
  memberCount: number; createdBy: UserSummary; isMember: boolean; createdAt: string
}

export interface Post {
  id: string; title: string | null; content: string; imageUrl: string | null
  author: UserSummary; communityId: string | null; communityName: string | null; communitySlug: string | null
  parentId: string | null; depth: number; upvotesCount: number; downvotesCount: number
  score: number; repliesCount: number; isDeleted: boolean; isPinned: boolean
  currentUserVote: VoteType | null; isSaved: boolean; createdAt: string; updatedAt: string
  ancestry?: Post[]
}

export interface Event {
  id: string; title: string; description: string; imageUrl: string | null
  location: string; mapBlockId: string | null; mapBlockName: string | null
  startDate: string; endDate: string | null; attendeesCount: number
  isAttending: boolean; createdBy: UserSummary; communityId: string | null; createdAt: string
}

export interface Product {
  id: string; title: string; description: string; price: number
  category: string | null; status: ProductStatus; imageUrls: string[]
  seller: UserSummary; sellerWhatsapp: string | null; createdAt: string
}

export interface MapBlock {
  id: string; name: string; code: string; description: string | null
  latitude: number; longitude: number; polygonCoords: string | null; floorCount: number
}

export interface Notification {
  id: string; type: string; message: string; actor: UserSummary | null
  referenceId: string | null; referenceType: string | null; isRead: boolean; createdAt: string
}

export interface Page<T> {
  content: T[]; totalElements: number; totalPages: number
  size: number; number: number; first: boolean; last: boolean
}

export interface AuthResponse {
  accessToken: string; refreshToken: string; user: UserSummary
}
