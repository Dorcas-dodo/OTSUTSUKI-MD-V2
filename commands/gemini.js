const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

module.exports = {
    name: "gemini",
    async execute(sock, m, { args }) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(args.join(" "));
        m.reply(result.response.text());
    }
};
