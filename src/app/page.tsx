export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">悦</span>
            </div>
            <span className="text-xl font-bold text-gray-800">悦己颜值社</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-gray-600 hover:text-primary-500 transition-colors">首页</a>
            <a href="/analysis" className="text-gray-600 hover:text-primary-500 transition-colors">变美分析</a>
            <a href="/style" className="text-gray-600 hover:text-primary-500 transition-colors">姿造美学</a>
            <a href="/explore" className="text-gray-600 hover:text-primary-500 transition-colors">灵感探索</a>
            <a href="/user/login" className="bg-primary-500 text-white px-4 py-2 rounded-full hover:bg-primary-600 transition-colors">登录</a>
          </nav>
        </header>

        <section className="text-center py-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">发现你的美</h1>
          <p className="text-gray-600 text-lg mb-8">科学分析，个性化推荐，让变美更简单</p>
          <div className="flex justify-center gap-4">
            <button className="bg-primary-500 text-white px-8 py-3 rounded-full text-lg hover:bg-primary-600 transition-colors">
              开始分析
            </button>
            <button className="border-2 border-primary-500 text-primary-500 px-8 py-3 rounded-full text-lg hover:bg-primary-50 transition-colors">
              了解更多
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary-500 text-xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI面部分析</h3>
            <p className="text-gray-600">智能分析面部特征，了解肤质类型</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-secondary-500 text-xl">💄</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">个性造型推荐</h3>
            <p className="text-gray-600">根据风格测试，定制专属造型方案</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-500 text-xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">生活美学计划</h3>
            <p className="text-gray-600">制定护肤、饮食、作息计划，养成好习惯</p>
          </div>
        </section>

        <footer className="text-center py-8 text-gray-500">
          <p>悦己颜值社 - 科学变美，悦己生活</p>
        </footer>
      </div>
    </div>
  )
}
