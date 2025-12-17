class CreateUsers < ActiveRecord::Migration[8.1]
  def up
    create_table :users do |t|
      t.string :email, null: false
      t.string :image_url, null: false, default: 'https://i.imgur.com/rfxjQeS.png'
      t.string :name, null: false
      t.string :password_digest, null: false
      t.string :session_token, null: false

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :session_token, unique: true
  end

  def down
    drop_table :users
  end
end