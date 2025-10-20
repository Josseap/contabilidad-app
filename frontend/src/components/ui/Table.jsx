export const Th = ({ children, className = '' }) => (
    <th
        className={`px-3 py-2 text-left font-medium text-gray-600 ${className}`}
    >
        {children}
    </th>
)

export const Td = ({ children, className = '' }) => (
    <td className={`px-3 py-2 ${className}`}>{children}</td>
)
