import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { isObjectInGroup } from "../../store/actions/actions-utils";
import LayerSimplified_GroupObjects from "./LayerSimplified_GroupObjects";
import LayerSimplified_AllLayers from "./LayerSimplified_AllLayers";

type IProps = ReturnType<typeof mapStateToProps>;

const LayersSimplifiedPanel = ({ selectedObjectIds, objectById }: IProps) => {
  const firstSelObjId = selectedObjectIds?.[0];
  if (firstSelObjId && isObjectInGroup(objectById[firstSelObjId], objectById)) {
    return <LayerSimplified_GroupObjects />;
  }
  return <LayerSimplified_AllLayers />;
};

const mapStateToProps = (state: IStore) => ({
  objectById: state.project.objects.objectById,
  selectedObjectIds: state.project.selection.selectedObjectIds,
});

export default connect(mapStateToProps)(LayersSimplifiedPanel);
