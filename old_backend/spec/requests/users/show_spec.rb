require 'rails_helper'

RSpec.describe "Api::Users show", type: :request do
  describe "GET /api/users/:id" do
    context "when user exists" do
      let!(:user) { create(:user, name: "John Doe", email: "john@example.com") }

      it "returns http success" do
        get "/api/users/#{user.id}"
        expect(response).to have_http_status(:success)
      end

      it "renders the expected user data fields" do
        get "/api/users/#{user.id}"

        expected_result = {
            "user" => {
                "id" => user.id,
                "email" => user.email,
                "name" => user.name
            }
        }
        
        expect(JSON.parse(response.body)).to eq(expected_result)
      end
    end

    context "with backed projects" do
      let!(:user) { create(:user) }
      let!(:project) { create(:project) }
      let!(:reward) { create(:reward, project: project) }
      let!(:backing) { create(:backing, backer: user, reward: reward) }

      it "returns http success" do
        get "/api/users/#{user.id}"
        expect(response).to have_http_status(:success)
      end

      it "includes user with their backed projects" do
        expected_result = {
            "user" => {
                "id" => user.id,
                "email" => user.email,
                "name" => user.name
            },
            "backed_projects" => {
                project.id.to_s => {
                    "id" => project.id,
                    "title" => project.title,
                    "short_blurb" => project.short_blurb,
                    "description" => project.description,
                    "funding_amount" => project.funding_amount,
                    "funding_end_date" => project.funding_end_date.iso8601(3),
                    "image_url" => project.image_url,
                    "category" => project.category,
                    "user_id" => project.user_id,
                    "percentage_funded" => project.percentage_funded
                }
            },
            "rewards" => {
                reward.id.to_s => {
                    "id" => reward.id,
                    "amount" => reward.amount,
                    "description" => reward.description,
                    "title" => reward.title,
                    "project_id" => reward.project_id
                }
            },
            "backings" => {
                backing.id.to_s => {
                    "id" => backing.id,
                    "user_id" => backing.user_id,
                    "reward_id" => backing.reward_id
                }
            }
        }

        get "/api/users/#{user.id}"

        actual_response = JSON.parse(response.body)
        expect(actual_response["user"]).to eq(expected_result["user"])
        expect(actual_response["backed_projects"]).to eq(expected_result["backed_projects"])
        expect(actual_response["rewards"]).to eq(expected_result["rewards"])
        expect(actual_response["backings"]).to eq(expected_result["backings"])
      end
    end
  end
end