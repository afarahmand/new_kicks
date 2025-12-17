class CreateRewards < ActiveRecord::Migration[8.1]
  def up
    create_table :rewards do |t|
      t.integer :amount, null: false
      t.string :description
      t.string :title, null: false
      t.references :project

      t.timestamps
    end
  end

  def down
    drop_table :rewards
  end
end