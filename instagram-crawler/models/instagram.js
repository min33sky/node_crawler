module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    'instagram',
    {
      postId: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      media: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      writer: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
    },
    {
      // 한글 + 이모티콘
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
  );
};
