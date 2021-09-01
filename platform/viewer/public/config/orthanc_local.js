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
  studyListFunctionsEnabled: true,
};
