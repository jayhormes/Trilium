import $ from "jquery";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    show: vi.fn(),
    copyImageToClipboard: vi.fn(async () => {}),
    copyImageReferenceToClipboard: vi.fn()
}));

vi.mock("./context_menu", () => ({ default: { show: mocks.show } }));

vi.mock("../services/i18n", () => ({ t: (key: string) => key }));

vi.mock("../services/utils", () => ({ default: { isElectron: () => true } }));

vi.mock("../services/image", () => ({
    default: {
        copyImageToClipboard: mocks.copyImageToClipboard,
        copyImageReferenceToClipboard: mocks.copyImageReferenceToClipboard
    }
}));

import imageContextMenu from "./image_context_menu";

/** Right-click `$target` and pick `command` from the menu the click opened. */
async function pick($target: JQuery<HTMLElement>, command: string) {
    $target.trigger($.Event("contextmenu", { pageX: 1, pageY: 2 }));
    const { selectMenuItemHandler } = mocks.show.mock.calls.at(-1)![0];
    await selectMenuItemHandler({ command });
}

describe("image context menu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("copies the image the menu is attached to", async () => {
        const $img = $<HTMLElement>("<img src=\"api/images/abc/x.png\">");
        imageContextMenu.setupContextMenu($img);

        await pick($img, "copyImageToClipboard");

        expect(mocks.copyImageToClipboard).toHaveBeenCalledWith("api/images/abc/x.png");
    });

    it("copies the image inside a wrapper, as the zoomable image viewer attaches it", async () => {
        const $wrapper = $<HTMLElement>("<div><div class=\"zoom\"><img src=\"api/attachments/att1/image/x.png\"></div></div>");
        imageContextMenu.setupContextMenu($wrapper);

        await pick($wrapper, "copyImageToClipboard");

        expect(mocks.copyImageToClipboard).toHaveBeenCalledWith("api/attachments/att1/image/x.png");
    });

    it("does nothing when the wrapper holds no image", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const $wrapper = $<HTMLElement>("<div></div>");
        imageContextMenu.setupContextMenu($wrapper);

        await pick($wrapper, "copyImageToClipboard");

        expect(mocks.copyImageToClipboard).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledWith("Missing src");
        consoleError.mockRestore();
    });
});
