const httpProxy = require("http-proxy")
const apiProxy = httpProxy.createServer({ target: "http://m2-operator-api-local-service:5000", secure: false })
const globalApiProxy = httpProxy.createServer({
    target: "http://m2-global-api-local-service:5000", secure: false, changeOrigin: true
})

module.exports = {
    mount: {
        public: "/",
        src: "/dist"
    },
    plugins: [
        "@snowpack/plugin-babel",
        "@snowpack/plugin-react-refresh",
        "@snowpack/plugin-dotenv"
    ],
    devOptions: {
        port: 4000
    },
    buildOptions: {
        metaUrlPath: "snowpack"
    },
    routes: [
        {
            src: "/api/.*",
            dest: (req, res) => {
                return apiProxy.web(req, res)
            }
        },
        {
            src: "/global-api/.*",
            dest: (req, res) => {
                return globalApiProxy.web(req, res)
            }
        },
        { match: "routes", src: ".*", dest: "/index.html" }
    ]
}
