# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_11_05_153228) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "projects", force: :cascade do |t|
    t.string "category", null: false
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.integer "funding_amount", null: false
    t.datetime "funding_end_date", null: false
    t.string "image_url"
    t.text "short_blurb", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["category"], name: "index_projects_on_category"
    t.index ["funding_amount"], name: "index_projects_on_funding_amount"
    t.index ["funding_end_date"], name: "index_projects_on_funding_end_date"
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "rewards", force: :cascade do |t|
    t.integer "amount", null: false
    t.datetime "created_at", null: false
    t.string "description"
    t.bigint "project_id"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_rewards_on_project_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "image_url", default: "https://i.imgur.com/rfxjQeS.png", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.string "session_token", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["session_token"], name: "index_users_on_session_token", unique: true
  end
end
