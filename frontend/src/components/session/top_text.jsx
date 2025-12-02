const TopText = ({ formType }) => {
    let text = "Sign in";
    if (formType === "Sign up") {
        text = "Sign up";
    }

    return (
        <div className="signin-form-top-text">
            <h2>{text}</h2>
        </div>
    )
}

export default TopText;