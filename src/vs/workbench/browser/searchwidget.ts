/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from 'vs/base/browser/dom';
import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { FindInput } from 'vs/base/browser/ui/findinput/findInput';
import { Widget } from 'vs/base/browser/ui/widget';

import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { Emitter, Event } from 'vs/base/common/event';



export class SearchWidget extends Widget {
	domNode!: HTMLElement;
	searchInput!: FindInput;
	private _onSearchSubmit = this._register(new Emitter<{ triggeredOnType: boolean; delay: number }>());
	readonly onSearchSubmit: Event<{ triggeredOnType: boolean; delay: number }> = this._onSearchSubmit.event;

	constructor(
		container: HTMLElement,
	) {
		super();
		this.render(container);
	}

	private renderSearchInput(parent: HTMLElement): void {
		const searchInputContainer = dom.append(parent, dom.$('.search-container.input-box'));
	}

	private render(container: HTMLElement): void {
		this.domNode = dom.append(container, dom.$('.search-widget'));
		this.domNode.style.position = 'relative';
		this.renderSearchInput(this.domNode);

	}

	private async submitSearch(triggeredOnType = false, delay: number = 0): Promise<void> {
		const value = this.searchInput.getValue();
		console.log('value', value);
		this._onSearchSubmit.fire({ triggeredOnType, delay });
	}

	private onSearchInputKeyDown(keyboardEvent: IKeyboardEvent) {
		if (keyboardEvent.equals(KeyCode.Enter)) {
			this.searchInput.onSearchSubmit();
			this.submitSearch();
			keyboardEvent.preventDefault();
		}
	}
}
