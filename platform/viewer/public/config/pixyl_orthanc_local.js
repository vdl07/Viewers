window.config = {
  routerBasename: '/ohif/',
  showStudyList: true,
  servers: {
    // This is an array, but we'll only use the first entry for now
    dicomWeb: [
      {
        name: 'Orthanc',
        wadoUriRoot: 'http://localhost/orthanc',
        qidoRoot: 'http://localhost/orthanc/dicom-web',
        wadoRoot: 'http://localhost/orthanc/dicom-web',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        // requestOptions: {
        // undefined to use JWT + Bearer auth
        // auth: 'orthanc:orthanc',
        // },
      },
    ],
  },
  hotkeys: [
    // ~ Global
    {
      commandName: 'enableMultiStackScroll',
      label: 'Push to enable multi-stack scroll',
      keys: ['ctrl'],
      type: 'keypress',
    },
    {
      commandName: 'disableMultiStackScroll',
      label: 'Do not modify',
      keys: ['ctrl'],
      type: 'keyup',
    },
    {
      commandName: 'showHideSegmentation',
      label: 'show/hide selected series segmentation',
      keys: ['s'],
    },
    {
      commandName: 'showHideAllSegmentation',
      label: 'show/hide all series segmentations',
      keys: ['a'],
    },
    {
      commandName: 'resetViewport',
      label: 'Reset viewport',
      keys: ['w'],
    },
  ],
  studyListFunctionsEnabled: true,
};
