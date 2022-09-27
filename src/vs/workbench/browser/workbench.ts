import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { InstantiationService } from "vs/platform/instantiation/common/instantiationService";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { EventType, addDisposableListener, getClientArea, Dimension, position, size, IDimension, isAncestorUsingFlowTo, computeScreenAwareSize } from 'vs/base/browser/dom';


export const enum Parts {
	TITLEBAR_PART = 'workbench.parts.titlebar',
	BANNER_PART = 'workbench.parts.banner',
	ACTIVITYBAR_PART = 'workbench.parts.activitybar',
	SIDEBAR_PART = 'workbench.parts.sidebar',
	PANEL_PART = 'workbench.parts.panel',
	AUXILIARYBAR_PART = 'workbench.parts.auxiliarybar',
	EDITOR_PART = 'workbench.parts.editor',
	STATUSBAR_PART = 'workbench.parts.statusbar'
}

export const enum Position {
	LEFT,
	RIGHT,
	BOTTOM
}

export const enum PanelOpensMaximizedOptions {
	ALWAYS,
	NEVER,
	REMEMBER_LAST
}

export type PanelAlignment = 'left' | 'center' | 'right' | 'justify';

// export class Workbench extends Layout {
export class Workbench {
    readonly container = document.createElement('div');
	private readonly parts = new Map<string, object>();

	constructor(
		private parent: HTMLElement,
		private readonly serviceCollection: ServiceCollection,
	) {
    }

    startup(): IInstantiationService {
        const instantiationService = this.initServices(this.serviceCollection);

        instantiationService.invokeFunction(accessor => {
            this.initLayout(accessor);
            this.renderWorkbench(instantiationService)
            this.createWorkbenchLayout();
            this.layout();
        });

        return instantiationService;
    }

	private renderWorkbench(instantiationService: IInstantiationService): void {
        
		// Create Parts
		for (const { id, role, classes } of [
			{ id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', 'left']}
        ]) {
			const partContainer = this.createPart(id, role, classes);
			// this.getPart(id).create(partContainer);

        }
        this.parent.appendChild(this.container);
    }

	private createPart(id: string, role: string, classes: string[]): HTMLElement {
		const part = document.createElement(role === 'status' ? 'footer' /* Use footer element for status bar #98376 */ : 'div');
		part.classList.add('part', ...classes);
		part.id = id;
		part.setAttribute('role', role);
		if (role === 'status') {
			part.setAttribute('aria-live', 'off');
		}

		return part;
	}
	protected getPart(key: Parts): object {
		const part = this.parts.get(key);
		if (!part) {
			throw new Error(`Unknown part ${key}`);
		}

		return part;
	}

    layout() : void{
        console.log('layout');
        this.container.innerHTML = "Hello World";
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
    }

    protected initLayout(accessor: ServicesAccessor): void {
    }
}