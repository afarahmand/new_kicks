const TopText = ({ formType }) => (
    (
        <div className="signin-form-top-text">
            <h2 data-testid="top-text">
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