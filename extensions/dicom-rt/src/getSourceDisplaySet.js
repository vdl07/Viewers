import { metadata } from '@ohif/core';

export default function getSourceDisplaySet(studies, rtStructDisplaySet, activateLabelMap = true) {
  const referencedDisplaySet = metadata.StudyMetadata.getReferencedDisplaySet(
    rtStructDisplaySet,
    studies
  );

  if (activateLabelMap && referencedDisplaySet) {
    rtStructDisplaySet.load(referencedDisplaySet, studies);
  }

  return referencedDisplaySet;
}
