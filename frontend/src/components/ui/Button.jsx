export default function Button({ children, className = '', ...p }) {
    return (
        <button
            {...p}
            className={`px-3 py-2 rounded-lg bg-gray-900 text-white ${className}`}
        >
            {children}
        </button>
    )
}
