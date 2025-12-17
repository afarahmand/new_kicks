require 'rails_helper'

RSpec.describe "Api::Users create", type: :request do
  describe "create" do
    context "with valid parameters" do
      let(:valid_attributes) do
        {
          user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
          }
        }
      end

      it "creates a new user" do
        expect {
          post "/api/users", params: valid_attributes
        }.to change(User, :count).by(1)
      end

      it "returns http success" do
        post "/api/users", params: valid_attributes
        expect(response).to have_http_status(:success)
      end

      it "returns the proper fields of the just created user" do
        post "/api/users", params: valid_attributes
        newly_created_user = User.find_by(email: valid_attributes[:user][:email])

        expected_result = {
            "id" => newly_created_user.id,
            "name" => valid_attributes[:user][:name],
            "email" => valid_attributes[:user][:email]
        }

        expect(JSON.parse(response.body)).to eq(expected_result)
      end

      it "creates a user with correct attributes" do
        post "/api/users", params: valid_attributes
        user = User.last
        expect(user.name).to eq("John Doe")
        expect(user.email).to eq("john@example.com")
      end
    end

    context "with invalid parameters" do
      context "when name is missing" do
        let(:invalid_attributes) do
          {
            user: {
              name: "",
              email: "john@example.com",
              password: "password123"
            }
          }
        end

        it "does not create a new user" do
          expect {
            post "/api/users", params: invalid_attributes
          }.not_to change(User, :count)
        end

        it "returns http unauthorized (401)" do
          post "/api/users", params: invalid_attributes
          expect(response).to have_http_status(401)
        end

        it "returns error messages as JSON" do
          post "/api/users", params: invalid_attributes
          expect(response.content_type).to match(/application\/json/)
          expect(JSON.parse(response.body)).to be_an(Array)
          expect(JSON.parse(response.body)[0]).to eq("Name can't be blank")
        end
      end

      context "when email is invalid" do
        let(:invalid_attributes) do
          {
            user: {
              name: "John Doe",
              email: "",
              password: "password123"
            }
          }
        end

        it "does not create a new user" do
          expect {
            post "/api/users", params: invalid_attributes
          }.not_to change(User, :count)
        end

        it "returns http unauthorized (401)" do
          post "/api/users", params: invalid_attributes
          expect(response).to have_http_status(401)
        end
      end

      context "when email is already taken" do
        let!(:existing_user) { create(:user, email: "john@example.com") }
        let(:duplicate_email_attributes) do
          {
            user: {
              name: "Jane Doe",
              email: "john@example.com",
              password: "password123"
            }
          }
        end

        it "does not create a new user" do
          expect {
            post "/api/users", params: duplicate_email_attributes
          }.not_to change(User, :count)
        end

        it "returns http unauthorized (401)" do
          post "/api/users", params: duplicate_email_attributes
          expect(response).to have_http_status(401)
        end

        it "returns appropriate error message" do
          post "/api/users", params: duplicate_email_attributes
          errors = JSON.parse(response.body)
          expect(errors).to include(a_string_matching(/email/i))
        end
      end

      context "when password is too short" do
        let(:invalid_attributes) do
          {
            user: {
              name: "John Doe",
              email: "john@example.com",
              password: "123"
            }
          }
        end

        it "does not create a new user" do
          expect {
            post "/api/users", params: invalid_attributes
          }.not_to change(User, :count)
        end

        it "returns http unauthorized (422)" do
          post "/api/users", params: invalid_attributes
          expect(response).to have_http_status(401)
        end
      end

      context "when password is missing" do
        let(:invalid_attributes) do
          {
            user: {
              name: "John Doe",
              email: "john@example.com",
              password: ""
            }
          }
        end

        it "does not create a new user" do
          expect {
            post "/api/users", params: invalid_attributes
          }.not_to change(User, :count)
        end

        it "returns http unauthorized (401)" do
          post "/api/users", params: invalid_attributes
          expect(response).to have_http_status(401)
        end
      end
    end

    context "when user params are not provided" do
      let(:invalid_attributes_no_user) do
        { name: "John" }
      end

      it "returns http unauthorized (422)" do
        post "/api/users", params: invalid_attributes_no_user
        expect(response).to have_http_status(400)
      end

      it "raises a parameter missing error" do
        post "/api/users", params:invalid_attributes_no_user
        expect(JSON.parse(response.body)["error"]).to include("param is missing")
      end
    end
  end
end