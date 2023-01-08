const { createRemoteFileNode } = require('gatsby-source-filesystem');

exports.normalize = async ({
  createNode,
  touchNode,
  getNode,
  store,
  cache,
  reporter,
  createNodeId,
  media,
}) => {
  let fileNodeID;

  if (media.internal && media.internal.type === `CardMedia`) {
    const remoteDataCacheKey = `card-media-${media.id}`;
    const cachedNodeId = await cache.get(remoteDataCacheKey);

    if (cachedNodeId) {
      reporter.verbose(`[gatsby-source-trello-board] restore card media from cache (node id: ${cachedNodeId})...`)
      fileNodeID = cachedNodeId.fileNodeID;
      touchNode(getNode(fileNodeID));
    }

    if (!fileNodeID) {
      try {
        const fileExt = media.url.split(".").pop();
        const fileNode = await createRemoteFileNode({
          url: media.url,
          cache,
          store,
          createNode,
          createNodeId,
          ext: `.${fileExt}`,
          name: media.name
        });
        if (fileNode) {
          fileNodeID = fileNode.id;
          await cache.set(remoteDataCacheKey, fileNodeID);
        }
      } catch (error) {
        console.log(`ERROR while creating remote file : ${error}`);
      }
    }
    if (fileNodeID) {
      reporter.verbose(`[gatsby-source-trello-board] link card media (${fileNodeID}) to parent (${media.id})...`)
      media.localFile___NODE = fileNodeID;
    }
    return media;
  }
};
