const httpProxy = require("http-proxy")
const apiProxy = httpProxy.createServer({ target: "https://op-api.nexentgame.com", secure: false, changeOrigin: true })
const globalApiProxy = httpProxy.createServer({
    target: "https://global-api.nexentgame.com", secure: false, changeOrigin: true
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
        port: 4000,
        secure: false,
    },
    buildOptions: {
        metaUrlPath: "snowpack"
    },
    routes: [
        // {
        //     src: "/api/.*",
        //     dest: (req, res) => {
        //         return apiProxy.web(req, res)
        //     }
        // },
        // {
        //     src: "/global-api/.*",
        //     dest: (req, res) => {
        //         return globalApiProxy.web(req, res)
        //     }
        // },
        { match: "routes", src: ".*", dest: "/index.html" }
    ]
}
