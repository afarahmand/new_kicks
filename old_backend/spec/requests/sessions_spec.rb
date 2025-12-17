require 'rails_helper'

RSpec.describe "Api::Sessions", type: :request do
  let(:user) {
    create(
      :user,
      email: "test@example.com",
      # password: "password", (already set in user factory)
      session_token: "old_token")
  }

  describe "POST /api/session" do
    context "with valid credentials" do
      let(:valid_params) do
        {
          user: {
            email: user.email,
            password: "password"
          }
        }
      end

      it "signs in the user by updating session token" do
        post "/api/session", params: valid_params
        expect(user.reload.session_token.length).to be > 15
      end

      it "returns a successful response" do
        post "/api/session", params: valid_params
        expect(response).to have_http_status(:success)
      end

      it "renders the show template" do
        post "/api/session", params: valid_params

        expected_result = {
          "id" => user.id,
          "email" => user.email,
          "name" => user.name
        }
        
        expect(JSON.parse(response.body)).to eq(expected_result)
      end
    end

    context "with invalid credentials" do
      let(:invalid_params) do
        {
          user: {
            email: "test@example.com",
            password: "wrongpassword"
          }
        }
      end

      it "does not sign in the user" do
        old_session_token = user.session_token
        post "/api/session", params: invalid_params
        expect(user.reload.session_token).to eq(old_session_token)
      end

      it "returns a 401 status" do
        post "/api/session", params: invalid_params
        expect(response).to have_http_status(401)
      end

      it "returns an error message" do
        post "/api/session", params: invalid_params
        expect(JSON.parse(response.body)).to include('Invalid email or password')
      end
    end

    context "with non-existent user" do
      let(:invalid_params) do
        {
          user: {
            email: "nonexistent@example.com",
            password: "password123"
          }
        }
      end

      it "returns a 401 status" do
        post "/api/session", params: invalid_params
        expect(response).to have_http_status(401)
      end

      it "returns an error message" do
        post "/api/session", params: invalid_params
        expect(JSON.parse(response.body)).to include('Invalid email or password')
      end
    end
  end

  describe "DELETE /api/session" do
    context "when user is signed in" do
      let(:valid_params) do
        {
          user: {
            email: user.email,
            password: "password"
          }
        }
      end
      
      # Signs in user
      before do
        post "/api/session", params: valid_params
      end

      it "signs out the user" do
        delete "/api/session"
        expect(session[:session_token]).to be_nil
      end

      it "returns a successful response" do
        delete "/api/session"
        expect(response).to have_http_status(:success)
      end

      it "returns an empty JSON object" do
        delete "/api/session"
        expect(JSON.parse(response.body)).to eq({})
      end
    end

    context "when user is not signed in" do
      it "returns a 404 status" do
        delete "/api/session"
        expect(response).to have_http_status(404)
      end

      it "returns an error message" do
        delete "/api/session"
        expect(JSON.parse(response.body)).to include('User is not signed in')
      end
    end
  end

  describe "GET /api/session" do
    context "with signed in user" do
      let(:valid_params) do
        {
          user: {
            email: user.email,
            password: "password"
          }
        }
      end

      # Signs in user
      before do
        post "/api/session", params: valid_params
      end

      it "returns a successful response" do
        get "/api/session", params: {}
        expect(response).to have_http_status(:success)
      end

      it "renders the show template" do
        get "/api/session", params: {}

        expected_result = {
          "id" => user.id,
          "email" => user.email,
          "name" => user.name
        }
        
        expect(JSON.parse(response.body)).to eq(expected_result)
      end
    end

    context "without signed in user" do
      it "returns a 200 status" do
        get "/api/session", params: {}
        expect(response).to have_http_status(:success)
      end

      it "returns an error message" do
        get "/api/session", params: {}
        expect(JSON.parse(response.body)).to eq({})
      end
    end
  end
end