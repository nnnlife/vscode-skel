import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { InstantiationService } from "vs/platform/instantiation/common/instantiationService";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { EventType, addDisposableListener, getClientArea, Dimension, position, size, IDimension, isAncestorUsingFlowTo, computeScreenAwareSize } from 'vs/base/browser/dom';
import { PlayGround } from 'vs/workbench/browser/playground';
import { GridView, Sizing } from 'vs/base/browser/ui/grid/gridview';

export class Workbench {
    readonly container = document.createElement('div');
    private _dimension!: IDimension;
    readonly gridView: GridView;
    playground: PlayGround;

    constructor(
        private parent: HTMLElement,
        private readonly serviceCollection: ServiceCollection,
    ) {
        console.log('client area', this.getClientArea());
        this.gridView = new GridView();
        this.container.prepend(this.gridView.element);
        this.playground = new PlayGround(this.container);
        this.gridView.addView(this.playground, Sizing.Distribute, [0]);
    }

    startup(): IInstantiationService {
        const instantiationService = this.initServices(this.serviceCollection);

        instantiationService.invokeFunction(accessor => {
            this.initLayout(accessor);
            this.renderWorkbench(instantiationService)
            this.createWorkbenchLayout();
            this.layout();
            this.restore();
        });

        return instantiationService;
    }
    restore(): void {
        // this.playground.openViewlet();
    }

    private renderWorkbench(instantiationService: IInstantiationService): void {
        this.parent.appendChild(this.container);
    }

    layout(): void {
        this._dimension = this.getClientArea();
        position(this.container, 0, 0, 0, 0, 'relative');
        size(this.container, this._dimension.width, this._dimension.height);
        this.gridView.layout(this._dimension.width, this._dimension.height);
    }

    private initServices(serviceCollection: ServiceCollection): IInstantiationService {
        const instantiationService = new InstantiationService(serviceCollection, true);
        return instantiationService;
    }

    private getClientArea(): Dimension {
        return getClientArea(this.parent);
    }

    // From layout.ts
    protected createWorkbenchLayout(): void {
        // originally create gridview and attach each parts(activity, sidebar, etc..) to gridview
        // and finally call this.container.prepend(workbenchGrid.element)
        // this.container.prepend(this.playground.element);
    }

    protected initLayout(accessor: ServicesAccessor): void {
    }
}
