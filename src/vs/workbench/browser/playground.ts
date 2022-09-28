import * as dom from 'vs/base/browser/dom';
import { Widget } from 'vs/base/browser/ui/widget';
import { SearchWidget } from 'vs/workbench/browser/searchwidget';
import 'vs/css!./media/searchview';
import { IView, IViewSize, LayoutPriority } from 'vs/base/browser/ui/grid/gridview';
import { Event, Relay } from 'vs/base/common/event';
import { position, size } from 'vs/base/browser/dom';

const $ = dom.$;


export class PlayGround extends Widget implements IView {
	private searchWidget!: SearchWidget;
	private searchWidgetsContainerElement!: HTMLElement;

	readonly element: HTMLElement = dom.$('.search-view');

	get minimumWidth(): number { return 400; }
	get maximumWidth(): number { return 400; }
	get minimumHeight(): number { return 400; }
	get maximumHeight(): number { return 400; }

	private _onDidChange = new Relay<{ width: number; height: number } | undefined>();
	readonly onDidChange = this._onDidChange.event;
	readonly priority: LayoutPriority = LayoutPriority.High;

	constructor(private parent: HTMLElement) {
		super();
		this.searchWidgetsContainerElement = dom.append(this.element, $('.search-widgets-container'));
		this.searchWidget = new SearchWidget(this.searchWidgetsContainerElement);
	}

	layout(width: number, height: number, top: number, left: number): void {
		position(this.element, top, width, height, 0);
		size(this.element, width, height);
	}

	openViewlet(id?: string): void {

	}
}
