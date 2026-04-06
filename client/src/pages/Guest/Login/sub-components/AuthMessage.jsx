export default function AuthMessage({ message }) {
    if (!message.text) {
        return null;
    }

    return (
        <div
            className={`p-4 text-sm text-center rounded-none border-2 font-bold uppercase mb-6 ${
                message.type === "success"
                    ? "bg-[#2a3f2a] border-[#5cb85c] text-[#5cb85c]"
                    : "bg-[#3f2a2a] border-[#ffb4ab] text-[#ffb4ab]"
            }`}
        >
            {message.text}
        </div>
    );
}
