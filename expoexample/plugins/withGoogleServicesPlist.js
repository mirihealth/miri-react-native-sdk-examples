const { withXcodeProject } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withGoogleServicesPlist(config) {
  return withXcodeProject(config, async (config) => {
    const project = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const platformRoot = config.modRequest.platformProjectRoot;

    const src = path.join(projectRoot, 'GoogleService-Info.plist');
    const appName = path.basename(platformRoot);
    const dest = path.join(platformRoot, appName, 'GoogleService-Info.plist');

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);

      // Add to Xcode project Resources group
      const groupName = appName;
      const group = project.pbxGroupByName(groupName);
      if (group) {
        const file = project.addResourceFile('GoogleService-Info.plist', {}, group.uuid);
        if (!file) {
          console.log('[withGoogleServicesPlist] File already in project');
        }
      }
    } else {
      console.warn('[withGoogleServicesPlist] GoogleService-Info.plist not found in project root');
    }

    return config;
  });
};
