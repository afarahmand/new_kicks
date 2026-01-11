require 'rails_helper'

RSpec.describe "Api::ProjectDiscovery", type: :request do
  let!(:tech_project_1) { create(:project, category: "Technology", title: "Tech Gadget") }
  let!(:tech_project_2) { create(:project, category: "Technology", title: "Tech Innovation") }
  let!(:art_project_1) { create(:project, category: "Art", title: "Art Masterpiece") }
  let!(:art_project_2) { create(:project, category: "Art", title: "Design Portfolio") }
  let!(:film_project) { create(:project, category: "Film", title: "Film Album") }

  describe "GET /api/project_discovery" do
    context "with empty category (all projects)" do
      let(:params) do
        { discovery: { category: "", sort: "Random", numProjects: 10 } }
      end

      it "returns http success" do
        get "/api/project_discovery", params: params
        expect(response).to have_http_status(:success)
      end

      it "returns all projects up to the limit" do
        get "/api/project_discovery", params: params
        expect(JSON.parse(response.body).length).to eq(5)
      end

      it "respects the numProjects limit" do
        params[:discovery][:numProjects] = 3
        get "/api/project_discovery", params: params
        expect(JSON.parse(response.body).length).to eq(3)
      end
    end

    context "with specific category filter" do
      let(:params) do
        { discovery: { category: "Technology", sort: "Random", numProjects: 10 } }
      end

      before do
        allow(Project).to receive(:discovery_results).and_call_original
      end

      it "returns http success" do
        get "/api/project_discovery", params: params
        expect(response).to have_http_status(:success)
      end

      it "calls Project.discovery_results with correct parameters" do
        expect(Project).to receive(:discovery_results).with(
          category: "Technology",
          sort: "Random"
        ).and_return(Project.where(category: "Technology"))
        
        get "/api/project_discovery", params: params
      end

      it "filters projects by category" do
        allow(Project).to receive(:discovery_results).and_return(
          Project.where(category: "Technology")
        )
        
        get "/api/project_discovery", params: params
        expect(JSON.parse(response.body).length).to eq(2)
      end

      it "respects the numProjects limit for filtered results" do
        params[:discovery][:numProjects] = 1
        allow(Project).to receive(:discovery_results).and_return(
          Project.where(category: "Technology")
        )
        
        get "/api/project_discovery", params: params
        expect(JSON.parse(response.body).length).to eq(1)
      end
    end

    context "with different sort options" do
      let(:params) do
        { discovery: { category: "Art", sort: "newest", numProjects: 10 } }
      end

      it "passes the sort parameter to discovery_results" do
        expect(Project).to receive(:discovery_results).with(
          category: "Art",
          sort: "newest"
        ).and_return(Project.where(category: "Art"))
        
        get "/api/project_discovery", params: params
      end

      it "returns http success" do
        get "/api/project_discovery", params: params
        expect(response).to have_http_status(:success)
      end
    end

    context "with various numProjects values" do
      it "handles numProjects of 0" do
        params = { discovery: { category: "", sort: "popular", numProjects: 0 } }
        get "/api/project_discovery", params: params
        expect(JSON.parse(response.body).length).to eq(0)
      end

      it "handles large numProjects values" do
        params = { discovery: { category: "", sort: "popular", numProjects: 100 } }
        get "/api/project_discovery", params: params
        expect(JSON.parse(response.body).length).to eq(5) # Only 5 projects exist
      end

      it "handles numProjects as string" do
        params = { discovery: { category: "", sort: "popular", numProjects: "5" } }
        get "/api/project_discovery", params: params
        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body).length).to eq(5)
      end
    end

    context "with unpermitted parameters" do
      it "ignores unpermitted parameters" do
        params = {
          discovery: {
            category: "Technology",
            sort: "popular",
            numProjects: 10,
            malicious_param: "hack"
          }
        }
        
        get "/api/project_discovery", params: params
        expect(response).to have_http_status(:success)
      end
    end
  end
end