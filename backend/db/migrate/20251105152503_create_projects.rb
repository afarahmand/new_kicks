class CreateProjects < ActiveRecord::Migration[8.1]
  def up
    create_table :projects do |t|
      t.string :title, null: false
      t.text :short_blurb, null: false
      t.text :description, null: false
      t.integer :funding_amount, null: false, index: true
      t.datetime :funding_end_date, null: false, index: true
      t.string :image_url
      t.references :user
      t.string :category, null: false, index: true

      t.timestamps
    end
  end

  def down
    drop_table :projects
  end
end