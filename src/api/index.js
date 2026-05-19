import request from '../utils/request'

export const articleApi = {
  getArticleList(params) {
    return request.get('/article', { params })
  },

  getArticleById(id) {
    return request.get(`/article/findOne/${id}`)
  },

  createArticle(data) {
    return request.post('/article', data)
  },

  updateArticle(id, data) {
    return request.put(`/article/${id}`, data)
  },

  deleteArticle(id) {
    return request.post(`/article/${id}/off`)
  },

  restoreArticle(id) {
    return request.post(`/article/${id}/on`)
  },

  searchArticles(key, params) {
    return request.get(`/article/fuzzyKeywords/${key}`, { params })
  },

  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/article/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadMd(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/article/uploadMd', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const dashboardApi = {
  getStats() {
    return Promise.all([
      this.getArticleCount(),
      this.getViewStats()
    ]).then(([articles, views]) => ({
      totalArticles: articles.total,
      publishedArticles: articles.list?.filter(a => !a.deletedAt).length || 0,
      draftArticles: articles.list?.filter(a => a.deletedAt).length || 0,
      totalViews: views
    }))
  },

  async getArticleCount() {
    const res = await request.get('/article', { params: { pageSize: 1 } })
    return res.result
  },

  getViewStats() {
    return request.get('/visit/total').then(res => res.result?.totalVisits || 0)
  },

  getRecentArticles() {
    return request.get('/article', { params: { pageNum: 1, pageSize: 5 } }).then(res => res.result)
  },

  getVisitStats(days = 7) {
    return request.get(`/visit/stats?days=${days}`).then(res => res.result)
  }
}

export const visitApi = {
  getVisitorList(params) {
    return request.get('/visit/visitors', { params }).then(res => res.result)
  }
}

export const projectApi = {
  getProjectList(params) {
    return request.get('/project', { params })
  },

  getProjectById(id) {
    return request.get(`/project/findOne/${id}`)
  },

  createProject(data) {
    return request.post('/project', data)
  },

  updateProject(id, data) {
    return request.put(`/project/${id}`, data)
  },

  deleteProject(id) {
    return request.post(`/project/${id}/off`)
  },

  restoreProject(id) {
    return request.post(`/project/${id}/on`)
  },

  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/project/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const authApi = {
  login(data) {
    return request.post('/user/login', data)
  },

  loginPhone(data) {
    return request.post('/user/loginPhone', data)
  },

  register(data) {
    return request.post('/user/register', data)
  },

  getUserInfo() {
    return request.get('/user/info')
  }
}

export const dictionaryApi = {
  getDictionaryList(params) {
    return request.get('/dictionary', { params })
  },

  getDictionaryById(id) {
    return request.get(`/dictionary/findOne/${id}`)
  },

  getByType(type) {
    return request.get(`/dictionary/findByType/${type}`).then(res => res.result || [])
  },

  getAllTypes() {
    return request.get('/dictionary/types').then(res => res.result || [])
  },

  createDictionary(data) {
    return request.post('/dictionary/create', data)
  },

  updateDictionary(id, data) {
    return request.put(`/dictionary/update/${id}`, data)
  },

  deleteDictionary(id) {
    return request.delete(`/dictionary/delete/${id}`)
  },

  initDictionary() {
    return request.post('/dictionary/init')
  }
}