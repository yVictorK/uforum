import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Attach JWT on every request
api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('uf_access')
    if (t) cfg.headers.Authorization = `Bearer ${t}`
  }
  return cfg
})

// Auto-refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config
    // Não tenta refresh em endpoints de autenticação — deixa o erro chegar ao caller
    const isAuthEndpoint = orig?.url?.includes('/auth/')
    if (err.response?.status === 401 && !orig._retry && !isAuthEndpoint) {
      orig._retry = true
      try {
        const rt = localStorage.getItem('uf_refresh')
        if (!rt) throw new Error('no refresh')
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt })
        localStorage.setItem('uf_access', data.accessToken)
        localStorage.setItem('uf_refresh', data.refreshToken)
        orig.headers.Authorization = `Bearer ${data.accessToken}`
        return api(orig)
      } catch {
        localStorage.removeItem('uf_access')
        localStorage.removeItem('uf_refresh')
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (d: unknown) => api.post('/auth/register', d),
  login: (d: unknown) => api.post('/auth/login', d),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (d: unknown) => api.post('/auth/reset-password', d),
}

export const usersApi = {
  getProfile: (u: string) => api.get(`/users/${u}`),
  updateProfile: (d: unknown) => api.patch('/users/me', d),
  follow: (u: string) => api.post(`/users/${u}/follow`),
  unfollow: (u: string) => api.delete(`/users/${u}/follow`),
  getPosts: (u: string, p = 0, includeReplies = false) => api.get(`/users/${u}/posts?page=${p}&size=20&includeReplies=${includeReplies}`),
  getFollowers: (u: string, p = 0) => api.get(`/users/${u}/followers?page=${p}&size=50`),
  getFollowing: (u: string, p = 0) => api.get(`/users/${u}/following?page=${p}&size=50`),
  getMyEvents: (p = 0) => api.get(`/users/me/events?page=${p}&size=20`),
  // FIX: add getSaved — backend now exposes /users/me/saved
  getSaved: (p = 0) => api.get(`/users/me/saved?page=${p}&size=20`),
  getNotifications: (p = 0) => api.get(`/users/me/notifications?page=${p}&size=30`),
  getUnreadCount: () => api.get('/users/me/notifications/unread-count'),
  markAllRead: () => api.post('/users/me/notifications/read-all'),
  markRead: (id: string) => api.post(`/users/me/notifications/${id}/read`),
}

export const communitiesApi = {
  list: (p = 0, q?: string) =>
    api.get(`/communities?page=${p}&size=20${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  getMyCommunities: (p = 0) => api.get(`/communities/my?page=${p}&size=50`),
  get: (slug: string) => api.get(`/communities/${slug}`),
  getPosts: (slug: string, p = 0, sort = 'new') =>
    api.get(`/communities/${slug}/posts?page=${p}&size=20&sort=${sort}`),
  create: (d: unknown) => api.post('/communities', d),
  update: (slug: string, d: unknown) => api.patch(`/communities/${slug}`, d),
  delete: (slug: string) => api.delete(`/communities/${slug}`),
  join: (slug: string) => api.post(`/communities/${slug}/join`),
  leave: (slug: string) => api.delete(`/communities/${slug}/leave`),
}

export const postsApi = {
  get: (id: string) => api.get(`/posts/${id}`),
  getReplies: (id: string, p = 0) => api.get(`/posts/${id}/replies?page=${p}&size=20`),
  getFollowingFeed: (p = 0) => api.get(`/posts/feed/following?page=${p}&size=20&sort=createdAt,desc`),
  search: (q: string, p = 0, sort = 'new') => {
    // FIX: pass sort to backend so ordering is respected
    const sortParam = sort === 'top' ? 'upvotesCount,desc' : 'createdAt,desc'
    return api.get(`/posts/search?q=${encodeURIComponent(q || '')}&page=${p}&size=20&sort=${sortParam}`)
  },
  create: (d: unknown) => api.post('/posts', d),
  vote: (id: string, type: string) => api.post(`/posts/${id}/vote?type=${type}`),
  save: (id: string) => api.post(`/posts/${id}/save`),
  delete: (id: string) => api.delete(`/posts/${id}`),
}

export const eventsApi = {
  list: (p = 0, q?: string) => api.get(`/events?page=${p}&size=20${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  get: (id: string) => api.get(`/events/${id}`),
  create: (d: unknown) => api.post('/events', d),
  update: (id: string, d: unknown) => api.put(`/events/${id}`, d),
  delete: (id: string) => api.delete(`/events/${id}`),
  attend: (id: string) => api.post(`/events/${id}/attend`),
}

export const marketplaceApi = {
  list: (p = 0, q?: string, cat?: string) => {
    let url = `/marketplace?page=${p}&size=20`
    if (q) url += `&q=${encodeURIComponent(q)}`
    if (cat) url += `&category=${encodeURIComponent(cat)}`
    return api.get(url)
  },
  get: (id: string) => api.get(`/marketplace/${id}`),
  getMine: (p = 0) => api.get(`/marketplace/my?page=${p}&size=20`),
  create: (d: unknown) => api.post('/marketplace', d),
  update: (id: string, d: unknown) => api.patch(`/marketplace/${id}`, d),
  updateStatus: (id: string, status: string) =>
    api.patch(`/marketplace/${id}/status?status=${status}`),
  delete: (id: string) => api.delete(`/marketplace/${id}`),
}

export const mapApi = {
  listBlocks: (q?: string) =>
    api.get(`/map/blocks${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getBlock: (id: string) => api.get(`/map/blocks/${id}`),
  createBlock: (d: unknown) => api.post('/map/blocks', d),
  updateBlock: (id: string, d: unknown) => api.put(`/map/blocks/${id}`, d),
  deleteBlock: (id: string) => api.delete(`/map/blocks/${id}`),
  // Floors
  getFloorsByBlock: (blockId: string) => api.get(`/map/blocks/${blockId}/floors`),
  getFloor: (id: string) => api.get(`/map/floors/${id}`),
  createFloor: (d: unknown) => api.post('/map/floors', d),
  deleteFloor: (id: string) => api.delete(`/map/floors/${id}`),
  // Rooms
  getRoomsByFloor: (floorId: string) => api.get(`/map/floors/${floorId}/rooms`),
  createRoom: (d: unknown) => api.post('/map/rooms', d),
  updateRoom: (id: string, d: unknown) => api.put(`/map/rooms/${id}`, d),
  deleteRoom: (id: string) => api.delete(`/map/rooms/${id}`),
  // Search
  searchRooms: (q: string) => api.get(`/map/search?q=${encodeURIComponent(q)}`),
}

export const reportsApi = {
  create: (d: unknown) => api.post('/reports', d),
  getPending: (p = 0) => api.get(`/reports/pending?page=${p}&size=20`),
  resolve: (id: string, status: string, notes?: string) => 
    api.post(`/reports/${id}/resolve?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`),
}

export const adminApi = {
  getUsers: (p = 0) => api.get(`/admin/users?page=${p}&size=20`),
  getMetrics: () => api.get('/admin/metrics'),
  updateRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role?role=${role}`),
  toggleStatus: (id: string) => api.patch(`/admin/users/${id}/status`),
}
