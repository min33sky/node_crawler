module.exports = (sequelize, Sequelize) => {
  // 테이블 이름은 proxies로 자동 설정
  return sequelize.define('proxy', {
    ip: {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true,
    },
    type: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    latency: {
      type: Sequelize.FLOAT.UNSIGNED, // 양수만
      allowNull: false,
    },
  });
};
