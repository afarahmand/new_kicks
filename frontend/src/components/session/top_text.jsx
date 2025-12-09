const TopText = ({ formType }) => (
    (
        <div className="signin-form-top-text">
            <h2>
                {
                    formType === "Sign up" ?
                        "Sign up" :
                        "Sign in"
                }
            </h2>
        </div>
    )
)

export default TopText;