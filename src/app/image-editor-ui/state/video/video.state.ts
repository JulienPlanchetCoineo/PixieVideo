import {Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
//import {CropToolService} from '../../../image-editor/tools/crop/crop-tool.service';
//import {CropZoneService} from '../../../image-editor/tools/crop/crop-zone.service';

interface VideoStateModel {
    dirty: boolean;
}

const VIDEO_STATE_DEFAULTS: VideoStateModel = {
    dirty: true,
};

@State<VideoStateModel>({
    name: 'video',
    defaults: VIDEO_STATE_DEFAULTS
})
export class VideoState extends BaseToolState<VideoStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.VIDEO;

    @Selector()
    static dirty(state: VideoStateModel) {
        return state.dirty;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
//        protected cropTool: CropToolService,
//        protected cropZone: CropZoneService,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<VideoStateModel>) {
        this.store.dispatch(new CloseForePanel());
        /*this.cropTool.apply(this.cropZone.getSize()).then(() => {
            this.history.add(HistoryNames.CROP);
            ctx.patchState(CROP_STATE_DEFAULTS);
        });*/
    }

   cancelChanges(ctx: StateContext<VideoStateModel>) {
       this.store.dispatch(new CloseForePanel());
//       ctx.patchState(CROP_STATE_DEFAULTS);
   }
}