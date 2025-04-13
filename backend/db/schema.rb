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

ActiveRecord::Schema[7.2].define(version: 2025_04_04_203732) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "users", force: :cascade do |t|
    t.string "visitor_id", null: false
    t.string "ip"
    t.string "country"
    t.string "device"
    t.string "cookie_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "os"
    t.string "browser"
    t.integer "screen_width"
    t.integer "screen_height"
    t.boolean "is_mobile"
    t.string "timezone"
    t.string "language"
    t.string "connection_type"
    t.string "session_id"
    t.integer "session_duration"
    t.integer "page_views"
    t.datetime "first_visit_date"
    t.datetime "last_visit_date"
    t.integer "visit_count"
    t.integer "days_since_last_visit"
    t.integer "clicks"
    t.integer "scrolls"
    t.integer "forms_submitted"
    t.string "entry_page"
    t.string "exit_page"
    t.float "avg_time_on_page"
    t.float "bounce_rate"
    t.string "referrer"
    t.string "utm_source"
    t.string "utm_medium"
    t.string "utm_campaign"
    t.string "utm_content"
    t.string "campaign_id"
    t.integer "products_viewed"
    t.integer "products_added_to_cart"
    t.boolean "checkout_started"
    t.boolean "purchase_completed"
    t.decimal "order_value"
    t.string "payment_method"
    t.string "coupon_used"
    t.string "city"
    t.string "region"
    t.string "postal_code"
    t.string "isp"
    t.float "latitude"
    t.float "longitude"
    t.jsonb "additional_data"
    t.index ["cookie_token"], name: "index_users_on_cookie_token"
    t.index ["visitor_id"], name: "index_users_on_visitor_id", unique: true
  end

  create_table "videos", force: :cascade do |t|
    t.string "title"
    t.string "youtube_id"
    t.text "subtitles"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end
