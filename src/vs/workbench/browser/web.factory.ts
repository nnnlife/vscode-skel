
import { toDisposable, IDisposable } from 'vs/base/common/lifecycle';
import { BrowserMain } from 'vs/workbench/browser/web.main';


export function create(domElement: HTMLElement): IDisposable {
    console.log('enter create');
    new BrowserMain(domElement).open().then(() => {
        console.log('browsermain open done');
    });

    return toDisposable(() => {
    });
}