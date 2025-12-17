class CreateBackings < ActiveRecord::Migration[8.1]
  def up
    create_table :backings do |t|
      t.integer :user_id, null: false
      t.integer :reward_id, null: false

      t.timestamps
    end

    add_index :backings, [:user_id, :reward_id], unique: true
  end

  def down
    drop_table :backings
  end
end