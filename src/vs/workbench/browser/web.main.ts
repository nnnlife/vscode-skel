import { mark } from 'vs/base/common/performance';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { domContentLoaded, detectFullscreen, getCookieValue } from 'vs/base/browser/dom';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { Workbench } from 'vs/workbench/browser/workbench';



export class BrowserMain extends Disposable {
	constructor(
		private readonly domElement: HTMLElement
    ) {
        super();

        this.init();
    }

    private init() : void {

    }

    async open(): Promise<void> {
        const [services] = await Promise.all([this.initServices(), domContentLoaded()])
        const workbench = new Workbench(this.domElement, services.serviceCollection)
        workbench.startup();
    }

    private async initServices(): Promise<{ serviceCollection: ServiceCollection }> {
        const serviceCollection = new ServiceCollection();
        return {serviceCollection}
    }

}