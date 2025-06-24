module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      publish_id: 37
    }
  }
}