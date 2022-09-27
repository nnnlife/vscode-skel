import * as dom from 'vs/base/browser/dom';
import { Widget } from 'vs/base/browser/ui/widget';
import { SearchWidget } from 'vs/workbench/browser/searchwidget';

const $ = dom.$;


export class PlayGround extends Widget {
	private container!: HTMLElement;
	private searchWidget!: SearchWidget;
	private searchWidgetsContainerElement!: HTMLElement;

	domNode!: HTMLElement;

	constructor(private parent: HTMLElement) {
		super();
		this.container = dom.$('.search-view');
		this.searchWidgetsContainerElement = dom.append(this.container, $('.search-widgets-container'));
		this.domNode = dom.append(this.container, dom.$('.search-widget'));
		this.domNode.style.position = 'relative';
		this.searchWidget = new SearchWidget(this.container);
	}

	openViewlet(id?: string): void {

	}

	get element(): HTMLElement { return this.container; }
}
