require 'rails_helper'

RSpec.describe "Api::Health", type: :request do
  describe "GET /api/health" do
    it "returns http success" do
      get "/api/health"
      expect(response).to have_http_status(:success)
    end

    it "returns a JSON response" do
      get "/api/health"
      expect(response.content_type).to match(/application\/json/)
    end

    it "returns the correct health message" do
      get "/api/health"
      json_response = JSON.parse(response.body)
      expect(json_response["message"]).to eq("Server is healthy.")
    end

    it "returns a hash with message key" do
      get "/api/health"
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key("message")
    end

    it "returns http 200 status code" do
      get "/api/health"
      expect(response).to have_http_status(200)
    end
  end
end