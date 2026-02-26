import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function ExtensionBlocker({ children }: { children: React.ReactNode }) {
    const [hasExtension, setHasExtension] = useState(false);

    useEffect(() => {
        let animationFrameId: number;

        const checkExtensions = () => {
            if (hasExtension) return; // Already blocked

            let detected = false;

            // 1. Check for specific known tags and IDs (Sider, Grammarly, Monica, MaxAI, ChatHub, Merlin, etc.)
            const suspectSelectors = [
                '#cappcast-shadow',
                '#sider-shadow-root',
                '#sider-app',
                'sider-app',
                'chatgpt-sidebar',
                'chatgpt-sidebar-popups',
                '[id*="sider-"]',
                'grammarly-desktop-integration',
                'grammarly-extension',
                '[data-grammarly-shadow-root]',
                '#weava-ui-wrapper',
                '#monica-app',
                '#monica-shadow-root',
                'monica-app',
                '[id*="monica-"]',
                '#immersivetranslate-popup',
                '#mrf-ext',
                'maxai-app',
                '#maxai-app',
                'harpa-app',
                '#harpa-ui',
                'chathub-app',
                '#chathub-shadow-root',
                'chatall-app',
                '#chatall-shadow-root',
                'merlin-app',
                '#merlin-shadow-root',
                '[id*="chatgpt"]',
                '[id*="bing-chat"]',
                '[id*="chathub"]'
            ];

            if (document.querySelectorAll(suspectSelectors.join(', ')).length > 0) {
                detected = true;
            }

            // 2. Check for extension URLs in the DOM (chrome-extension:// or moz-extension://)
            if (!detected) {
                const allElements = document.querySelectorAll('iframe, script, link, img');
                for (let i = 0; i < allElements.length; i++) {
                    const src = (allElements[i] as any).src || (allElements[i] as any).href || '';
                    if (typeof src === 'string' && (src.includes('chrome-extension://') || src.includes('moz-extension://'))) {
                        detected = true;
                        break;
                    }
                }
            }

            // 3. Look for custom extension elements directly injected in body
            if (!detected) {
                Array.from(document.body.children).forEach(child => {
                    // Ignore our own app root, portals, text nodes, and standard script/style elements
                    if (child.id === 'root' || child.tagName.toLowerCase() === 'script' || child.tagName.toLowerCase() === 'noscript' || child.tagName.toLowerCase() === 'style' || child.tagName.toLowerCase() === 'link') {
                        return;
                    }

                    const tag = child.tagName.toLowerCase();
                    // Custom elements usually have a hyphen. React app is inside <div id="root">
                    if (tag.includes('-')) {
                        detected = true;
                    }

                    // Many modern extensions use shadow DOM directly on a generic div
                    if (child.shadowRoot) {
                        detected = true;
                    }

                    // Check classes for common extension names
                    if (child.className && typeof child.className === 'string') {
                        const classLower = child.className.toLowerCase();
                        if (classLower.includes('chathub') || classLower.includes('chatall') ||
                            classLower.includes('chatgpt') || classLower.includes('sider') ||
                            classLower.includes('monica') || classLower.includes('maxai')) {
                            detected = true;
                        }
                    }

                    // Suspicious IFRAMES (empty src or extension src) directly in body
                    if (tag === 'iframe') {
                        const src = (child as HTMLIFrameElement).src || '';
                        if (src === '' || src === 'about:blank' || src.includes('chrome-extension://')) {
                            // Legitimate apps usually don't put empty iframes directly as body children
                            // Extensions use this for isolation
                            detected = true;
                        }
                    }

                    // Look for common AI / Extension keywords in ID
                    if (child.id) {
                        const idLower = child.id.toLowerCase();
                        if (idLower.includes('chatgpt') || idLower.includes('sider') || idLower.includes('monica') ||
                            idLower.includes('maxai') || idLower.includes('chathub') || idLower.includes('ai-') ||
                            idLower.includes('-ai') || idLower.includes('extension') || idLower.includes('chatall')) {
                            detected = true;
                        }
                    }
                });

                // Also check documentElement for injected siblings to <head> or <body>
                Array.from(document.documentElement.children).forEach(child => {
                    const tag = child.tagName.toLowerCase();
                    if (tag !== 'head' && tag !== 'body') {
                        detected = true;
                    }
                });
            }

            if (detected) {
                setHasExtension(true);
            }
        };

        // Trap future shadow dom creations
        const originalAttachShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (init) {
            setHasExtension(true);
            return originalAttachShadow.call(this, init);
        };

        // Use MutationObserver to catch extensions that inject after initial load
        const observer = new MutationObserver(() => {
            checkExtensions();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        observer.observe(document.documentElement, { childList: true });

        // Initial check
        checkExtensions();

        // Fallback polling check just in case MutationObserver misses closed shadow roots
        const poll = () => {
            checkExtensions();
            animationFrameId = requestAnimationFrame(poll);
        };
        poll();

        return () => {
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
            Element.prototype.attachShadow = originalAttachShadow;
        };
    }, [hasExtension]);

    if (hasExtension) {
        return (
            <div className="fixed inset-0 z-[999999] bg-[#05050c] flex items-center justify-center p-4 text-cyan-500 font-sans" style={{ msoHide: 'all' }}>
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Sleek Dialog Box */}
                <div className="bg-black/80 border border-red-500/30 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-md relative overflow-hidden group">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                    <div className="flex flex-col items-center text-center">
                        <ShieldAlert size={48} className="text-red-500/80 mb-4" />

                        <h2 className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-white/90 mb-2">
                            Security Protocol
                        </h2>

                        <p className="text-red-400 text-[10px] uppercase tracking-widest mb-6 border border-red-500/20 bg-red-500/5 px-3 py-1 rounded-full">
                            Unauthorized Modification
                        </p>

                        <p className="text-white/60 text-xs leading-relaxed mb-6 font-sans">
                            Browser extensions (like Sider, Grammarly, or AI Assistants) are interfering with the timeline environment.
                        </p>

                        <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-left mb-6">
                            <h3 className="text-white/40 text-[9px] uppercase tracking-widest mb-3">Required Actions</h3>
                            <ul className="text-white/70 text-[11px] font-sans space-y-2 list-disc list-inside">
                                <li>Disable extensions in <kbd className="bg-white/10 px-1 rounded text-white/40">chrome://extensions</kbd></li>
                                <li>Or use an Incognito / Private window</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} />
                            Verify Clearance & Reload
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
