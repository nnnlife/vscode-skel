import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { InstantiationService } from "vs/platform/instantiation/common/instantiationService";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { EventType, addDisposableListener, getClientArea, Dimension, position, size, IDimension, isAncestorUsingFlowTo, computeScreenAwareSize } from 'vs/base/browser/dom';
import { PlayGround } from 'vs/workbench/browser/playground';

export class Workbench {
    readonly container = document.createElement('div');
    readonly playground: PlayGround;

    constructor(
        private parent: HTMLElement,
        private readonly serviceCollection: ServiceCollection,
    ) {
        console.log('client area', this.getClientArea());
        this.playground = new PlayGround(this.container);
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
        this.playground.openViewlet();
    }

    private renderWorkbench(instantiationService: IInstantiationService): void {
        this.parent.appendChild(this.container);
    }

    layout(): void {
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
        this.container.prepend(this.playground.element);
    }

    protected initLayout(accessor: ServicesAccessor): void {
    }
}
