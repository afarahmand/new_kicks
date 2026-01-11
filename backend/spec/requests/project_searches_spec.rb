require 'rails_helper'

RSpec.describe "Api::ProjectSearches", type: :request do
  let!(:tech_project_1) { create(:project, category: "Technology", title: "Tech Gadget") }
  let!(:tech_project_2) { create(:project, category: "Technology", title: "Tech Innovation") }
  let!(:art_project_1) { create(:project, category: "Art", title: "Art Masterpiece") }
  let!(:art_project_2) { create(:project, category: "Art", title: "Design Portfolio") }
  let!(:film_project) { create(:project, category: "Film", title: "Film Album") }

  describe "GET /api/project_searches" do
    context "with empty query (all projects)" do
      let(:params) do
        { search: { query: "", category: "", sort: "Random" } }
      end

      it "returns http success" do
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end

      it "returns all projects limited to 9" do
        get "/api/project_searches", params: params
        expect(JSON.parse(response.body).length).to eq(5)
      end

      it "limits results to 9 even with more projects" do
        create_list(:project, 10)
        get "/api/project_searches", params: params
        expect(JSON.parse(response.body).length).to eq(9)
      end
    end

    context "with search query" do
      let(:params) do
        { search: { query: "Tech", category: "", sort: "Random" } }
      end

      before do
        allow(Project).to receive(:search_results).and_call_original
      end

      it "returns http success" do
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end

      it "calls Project.search_results with the query" do
        expect(Project).to receive(:search_results).with("Tech").and_return(
          Project.where("title LIKE ?", "%Tech%")
        )
        
        get "/api/project_searches", params: params
      end

      it "returns matching projects" do
        allow(Project).to receive(:search_results).and_return(
          Project.where("title LIKE ?", "%Tech%")
        )
        
        get "/api/project_searches", params: params
        expect(JSON.parse(response.body).length).to eq(2)
      end

      it "limits search results to 9 projects" do
        create_list(:project, 15, title: "Tech Project")
        
        get "/api/project_searches", params: params

        expect(JSON.parse(response.body).length).to eq(9)
      end
    end

    context "with different search queries" do
      it "searches for Art projects" do
        params = { search: { query: "Art", category: "", sort: "Random" } }
        allow(Project).to receive(:search_results).and_return(
          Project.where("title LIKE ?", "%Art%")
        )
        
        get "/api/project_searches", params: params
        expect(Project).to have_received(:search_results).with("Art")
        expect(response).to have_http_status(:success)
      end

      it "searches for Music projects" do
        params = { search: { query: "Music", category: "", sort: "Random" } }
        allow(Project).to receive(:search_results).and_return(
          Project.where("title LIKE ?", "%Music%")
        )
        
        get "/api/project_searches", params: params
        expect(Project).to have_received(:search_results).with("Music")
      end

      it "handles case-sensitive queries" do
        params = { search: { query: "TECH", category: "", sort: "Random" } }
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end
    end

    context "with no matching results" do
      let(:params) do
        { search: { query: "NonexistentProject", category: "", sort: "Random" } }
      end

      it "returns http success" do
        allow(Project).to receive(:search_results).and_return(Project.none)
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end

      it "returns an empty collection" do
        allow(Project).to receive(:search_results).and_return(Project.none)
        get "/api/project_searches", params: params
        expect(JSON.parse(response.body)).to be_empty
      end
    end

    context "with category and sort parameters" do
      let(:params) do
        { search: { query: "Tech", category: "Technology", sort: "newest" } }
      end

      it "accepts category parameter (even if not used in logic)" do
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end

      it "accepts sort parameter (even if not used in logic)" do
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end
    end

    context "with unpermitted parameters" do
      it "ignores unpermitted parameters" do
        params = {
          search: {
            query: "Tech",
            category: "Technology",
            sort: "Random",
            unauthorized_param: "malicious"
          }
        }
        
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end
    end

    context "with special characters in query" do
      it "handles queries with special characters" do
        params = { search: { query: "Tech & Art", category: "", sort: "Random" } }
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end

      it "handles queries with quotes" do
        params = { search: { query: "\"Amazing\"", category: "", sort: "Random" } }
        get "/api/project_searches", params: params
        expect(response).to have_http_status(:success)
      end
    end
  end
end