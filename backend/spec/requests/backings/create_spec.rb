require 'rails_helper'

RSpec.describe "Api::Backings create", type: :request do
  let(:user) { create(:user) }
  let(:project_owner) { create(:user) }
  let(:project) { create(:project, user: project_owner) }
  let(:reward) { create(:reward, project: project) }

  let(:sign_in_params) do
    {
      user: {
        email: user.email,
        password: "password"
      }
    }
  end

  describe "POST /api/backings" do
    context "with valid params and signed in user" do
      # Signs in user
      before do
        post "/api/session", params: sign_in_params
      end

      let(:valid_params) do
        { reward_id: reward.id }
      end

      it "creates a new backing" do
        expect {
          post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: valid_params
        }.to change(Backing, :count).by(1)
      end

      it "associates the backing with the current user" do
        post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: valid_params
        expect(Backing.last.user_id).to eq(user.id)
      end

      it "associates the backing with the reward" do
        post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: valid_params
        expect(Backing.last.reward_id).to eq(reward.id)
      end

      it "returns a successful response" do
        post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: valid_params
        expect(response).to have_http_status(:success)
      end

      it "renders the show template" do
        post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: valid_params

        backing = Backing.last
        expected_result = {
          "backing" => {
            "id" => backing.id,
            "user_id" => user.id,
            "reward_id" => reward.id
          }
        }
        
        expect(JSON.parse(response.body)).to eq(expected_result)
      end
    end

    context "when user is not signed in" do
      it "returns a 401 status" do
        post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: { reward_id: reward.id }
        expect(response).to have_http_status(401)
      end

      it "returns an error message" do
        post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: { reward_id: reward.id }
        expect(JSON.parse(response.body)).to include("You must be signed in to back projects")
      end
    end

    context "when user tries to back their own project" do
      # Signs in user
      before do
        post "/api/session", params: sign_in_params
      end

      let(:own_project) { create(:project, user: user) }
      let(:own_reward) { create(:reward, project: own_project) }

      it "does not create a backing" do
        expect {
          post "/api/projects/#{own_project.id}/rewards/#{own_reward.id}/backings", params: { reward_id: own_reward.id }
        }.not_to change(Backing, :count)
      end

      it "returns a 403 status" do
        post "/api/projects/#{own_project.id}/rewards/#{own_reward.id}/backings", params: { reward_id: own_reward.id }
        expect(response).to have_http_status(403)
      end

      it "returns an error message" do
        post "/api/projects/#{own_project.id}/rewards/#{own_reward.id}/backings", params: { reward_id: own_reward.id }
        expect(JSON.parse(response.body)).to include("You can't back your own projects")
      end
    end

    context "when project does not exist" do
      # Signs in user
      before do
        post "/api/session", params: sign_in_params
      end

      let(:orphan_reward) { build(:reward, id: 99999, project_id: 99999) }
      
      before do
        allow(Reward).to receive(:find_by).with(id: "99999").and_return(orphan_reward)
        allow(orphan_reward).to receive(:project).and_return(nil)
      end

      it "returns a 404 status" do
        post "/api/projects/#{project.id}/rewards/#{orphan_reward.id}/backings", params: { reward_id: 99999 }
        expect(response).to have_http_status(404)
      end

      it "returns an error message" do
        post "/api/projects/#{project.id}/rewards/#{orphan_reward.id}/backings", params: { reward_id: 99999 }
        expect(JSON.parse(response.body)).to include("You can't back a project that does not exist")
      end
    end

    context "when reward does not exist" do
      # Signs in user
      before do
        post "/api/session", params: sign_in_params
      end

      nonexistent_reward_id = 99999

      it "returns a 404 status" do
        post "/api/projects/#{project.id}/rewards/#{nonexistent_reward_id}/backings", params: { reward_id: nonexistent_reward_id }
        expect(response).to have_http_status(404)
      end

      it "returns an error message" do
        post "/api/projects/#{project.id}/rewards/#{nonexistent_reward_id}/backings", params: { reward_id: nonexistent_reward_id }
        expect(JSON.parse(response.body)).to include("You must choose an existing reward to back a project")
      end
    end

    context "when user has already backed the project" do
      before do
        create(:backing, user: user, reward: reward)
        post "/api/session", params: sign_in_params
      end

      it "does not create another backing" do
        expect {
          post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: { reward_id: reward.id }
        }.not_to change(Backing, :count)
      end

      it "returns a 403 status" do
        post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: { reward_id: reward.id }
        expect(response).to have_http_status(403)
      end

      it "returns an error message" do
        post "/api/projects/#{project.id}/rewards/#{reward.id}/backings", params: { reward_id: reward.id }
        expect(JSON.parse(response.body)).to include("You can't back a project again once you have already backed it")
      end
    end
  end
end