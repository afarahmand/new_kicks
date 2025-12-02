const ErrorIndex = ({ errors }) => {
    if (!errors || errors.length === 0) return null;
    
    return (
        <div className="error-display">
            <ul>
                {
                    errors.map((error, i) => (
                        <li key={`error-${i}`}>{error}</li>
                    ))
                }
            </ul>
        </div>
    )
}

export default ErrorIndex;