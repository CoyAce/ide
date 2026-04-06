<script lang="ts">
    import {onMount, tick} from 'svelte';
    import type {Product} from "./+page";
    import JbIcon from './icon.svelte'
    import '$lib/tailwind.css'

    type ThemeMode = 'light' | 'dark';

    let {data} = $props();
    let productSources: Array<Product> = $state([]);
    let filterInput: string = $state("");
    let productList: Array<Product> = $derived.by(() => {
        return productSources.filter((product) => {
            return product.name.toLowerCase().includes(filterInput.toLowerCase());
        });
    })

    let isDrawerOpen: boolean = $state(false);
    let licenseId: string = $state("default");
    let name: string = $state("name");
    let user: string = $state("user");
    let email: string = $state("i@user.com");
    let themeMode: ThemeMode = $state('light');

    let headerHeight: number | undefined = $state(0);
    let headerRef: HTMLHeadElement | undefined = $state(undefined);
    $effect(() => {
        headerHeight = headerRef?.offsetHeight;
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        licenseId = Array.from(
            {length: 10},
            () => charset[Math.floor(Math.random() * charset.length)]
        ).join('');
    });

    onMount(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            themeMode = 'dark';
        }
    });

    function toggleDrawer() {
        isDrawerOpen = !isDrawerOpen;
    }

    async function toggleTheme() {
        themeMode = themeMode === 'dark' ? 'light' : 'dark';
        await tick();
    }

    function filterSources(family: Array<string>) {
        productSources = data.products.filter((product) => {
            return family.includes(product.productFamilyName);
        });
    }

    async function copyLicense(event: Event, code: string) {
        let p = event.target as HTMLParagraphElement;
        try {
            let date = new Date();
            let response = await fetch(`/api/rpc/license?licenseId=${licenseId}&name=${name}&user=${user}&email=${email}&time=${date.getFullYear() + 2}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}&codes=${code}`);
            let licenseCode = await response.json();
            await navigator.clipboard.writeText(licenseCode.licenseCode)
            p.setAttribute('data-content', 'Copied!');
        } catch (error) {
            p.setAttribute('data-content', 'Copy failed!');
        }
        setTimeout(
            () => {
                p.setAttribute('data-content', 'Copy to clipboard');
            }, 1500
        );
    }
</script>

<svelte:window onresize={() => {headerHeight = headerRef?.offsetHeight}}/>

<!-- svelte-ignore a11y_invalid_attribute -->
<JbIcon filter={filterSources}/>

<div class:theme-dark={themeMode === 'dark'} class="flex flex-col min-h-screen theme-shell" id="container">
    <header bind:this={headerRef} class="sticky top-[2.3%] bg-(--card-bg) text-(--text-main) z-50 w-[80%] mx-auto shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)] transition-all duration-250 ease-in-out hover:translate-y-[2px] hover:shadow-[0_4px_20px_0_rgba(0,0,0,0.12)] flex flex-col md:flex-row items-start md:items-center md:justify-between px-6 py-3
                                        {isDrawerOpen ? 'rounded-t-[16px] rounded-b-none' : 'rounded-[16px]'}">
        <p class="block md:my-[1em] mx-0 break-words md:max-w-[50%]">
            Download <a
                class="text-(--accent) no-underline"
                href="https://gitee.com/ja-netfilter/ja-netfilter/releases/download/2025.3.0/ja-netfilter-2025.3.0.zip"
                title="Download jetbra first">jetbra.zip</a>, and configure as described in
            <strong>readme.txt</strong>! For testing purposes only, not for
            commercial use! <br>
            <strong>Please note that this is just a personal page, not an official website!</strong>
        </p>

        <div class="header-actions flex flex-col items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0 md:flex-row md:justify-end md:self-start">
            <button
                    type="button"
                    class="theme-toggle"
                    aria-label={themeMode === 'dark' ? '切换到亮色模式' : '切换到暗黑模式'}
                    title={themeMode === 'dark' ? '切换到亮色模式' : '切换到暗黑模式'}
                    onclick={toggleTheme}
            >
                {#if themeMode === 'dark'}
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="theme-toggle-icon">
                        <circle cx="12" cy="12" r="4.5" fill="currentColor"></circle>
                        <path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.72 5.28l-1.77 1.77M7.05 16.95l-1.77 1.77M18.72 18.72l-1.77-1.77M7.05 7.05 5.28 5.28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                    </svg>
                {:else}
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="theme-toggle-icon">
                        <path d="M20.2 14.2A8.8 8.8 0 0 1 9.8 3.8a0.4 0.4 0 0 0-.56-.46A9.7 9.7 0 1 0 20.66 14.76a0.4 0.4 0 0 0-.46-.56Z" fill="currentColor"></path>
                    </svg>
                {/if}
            </button>

            <div class="flex flex-col items-center gap-3 w-full md:w-auto shrink-0 md:flex-row md:justify-end">
                <button
                        type="button"
                        class="drawer-toggle flex items-center justify-between gap-3 min-w-[220px] rounded-[14px] border border-[var(--mui-outline)] bg-[var(--mui-surface)] px-4 py-3 text-left text-[var(--text-main)] shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 hover:bg-[var(--mui-surface-hover)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                        aria-expanded={isDrawerOpen}
                        aria-controls="license-drawer"
                        onclick={toggleDrawer}
                >
                    <span class="flex flex-col leading-tight">
                        <span class="text-xs uppercase tracking-[0.08em] text-[var(--text-grey)]">License config</span>
                        <span class="text-sm font-medium">{isDrawerOpen ? 'Hide fields' : 'Show fields'}</span>
                    </span>
                    <svg
                            class={`h-5 w-5 shrink-0 text-[var(--text-grey)] transition-transform duration-200 ${isDrawerOpen ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                    >
                        <path d="m6 9 6 6 6-6"></path>
                    </svg>
                </button>

                <div class="flex items-center gap-3 w-full md:w-auto shrink-0">
                    <div class="search-container flex items-center flex-grow sm:flex-grow-0">
                        <input
                                type="text"
                                placeholder="Search products..."
                                bind:value={filterInput}
                                class="rounded-(--radius) border border-(--border-color) bg-transparent py-2 px-4 outline-none focus:border-(--accent) transition-all duration-250 text-(--text-main) w-[180px]"
                        />
                        <button
                                class="ml-2 p-2 rounded-(--radius) bg-(--accent) text-white hover:opacity-90 transition-opacity duration-250"
                                onclick={() => filterInput = ''}
                                aria-label="Clear search"
                                style="display: {filterInput ? 'block' : 'none'}"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="text-(--text-grey) text-sm whitespace-nowrap">
                        {productList.length}/{productSources.length}
                        {#if filterInput}
                            <span class="ml-1 text-(--accent) font-medium hidden md:inline">"{filterInput}"</span>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

    </header>

    <div class="sticky w-[80%] mx-auto z-40 top-[calc(2.3%+var(--header-height))]"
         style="--header-height: {headerHeight}px"
    >
        <div
                id="license-drawer"
                class={`drawer-panel overflow-hidden rounded-[20px] border border-[var(--mui-outline)] bg-[var(--mui-surface)] text-[var(--text-main)] shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-250 ease-out ${isDrawerOpen ? 'mt-3 max-h-[320px] opacity-100' : 'mt-0 max-h-0 opacity-0 border-transparent shadow-none'}`}
        >
            <div class={`grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2 transition-opacity duration-200 ${isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                <label class="field-group">
                    <span class="field-label">License Id</span>
                    <input type="text" bind:value={licenseId} placeholder="License Id"
                           class="field-input">
                </label>
                <label class="field-group">
                    <span class="field-label">Name</span>
                    <input type="text" bind:value={name} placeholder="Name"
                           class="field-input">
                </label>
                <label class="field-group">
                    <span class="field-label">User</span>
                    <input type="text" bind:value={user} placeholder="User"
                           class="field-input">
                </label>
                <label class="field-group">
                    <span class="field-label">Email</span>
                    <input type="text" bind:value={email} placeholder="Email"
                           class="field-input">
                </label>
            </div>
        </div>
    </div>


    <main class="px-6 py-10 grid gap-(--gutter,1rem) grid-cols-[repeat(auto-fill,minmax(min(var(--space,10rem),100%),1fr))]"
          style="--space: 20rem; --gutter: 3.5rem">
        {#each productList as product}
            <article
                    class="group shadow-lg rounded-2xl transition-[background-color,color,box-shadow,transform] duration-300 ease-in-out w-[90%] relative overflow-visible bg-(--card-bg) mx-auto hover:-translate-y-0.5"
                    data-sequence={product.Code}>
                <header class="card-header px-6 pt-(--spacing) pb-0">
                        <div class="relative w-(--size) h-(--size) text-[1.25rem] select-none translate-y-1/2 flex items-center justify-center overflow-hidden shrink-0">
                            <svg class="w-full h-full m-0 bg-card-bg text-transparent object-cover text-center text-indent-10000"
                                 role="img">
                                <use href={`#${product.productFamilyName}`}></use>
                            </svg>
                        </div>
                        <button data-version={product.version} class="cursor-pointer outline-none select-none inline-block items-center justify-between border border-transparent rounded-(--radius) box-border px-[21px] py-[12px] font-normal tracking-[1.2px] bg-transparent transition-[border,color] duration-250 ease-out max-w-[60%]
                     dark:text-gray-500 text-sm text-right relative
                     before:content-[attr(data-version)] before:whitespace-nowrap before:truncate before:w-full before:block hover:border-(--accent) hover:text-(--accent)">
                            <ul class="absolute top-full left-0 bg-(--main-bg) backdrop-blur-[18px] w-fit rounded-(--text-sm) shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-left opacity-0 invisible transition ease-in-out duration-300 z-99
                            before:content-[''] before:absolute before:-top-[6px] before:left-5 before:w-0 before:h-0 before:shadow-[2px_-2px_6px_rgba(0,0,0,0.05)] before:border-t-[6px] before:border-t-(--main-bg) before:border-r-[6px] before:border-r-(--main-bg) before:border-b-[6px] before:border-b-transparent before:border-l-[6px] before:border-l-transparent before:-rotate-45 before:mix-blend-multiply">
                                <li class="active z-99 relative bg-transparent px-5 text-(--text-main) transition-colors duration-250 ease-out hover:bg-(--hover-color) first:rounded-t-(--text-sm) last:rounded-b-(--text-sm)">
                                    <a href="#"
                                       class="block border-b border-(--border-color) py-[16px] text-inherit no-underline whitespace-nowrap active:text-(--accent) last:border-b-0">{product.version}</a>
                                </li>
                            </ul>
                        </button>
                </header>
                <div class="card-body p-6 overflow-hidden pt-10">
                    <h1 class="line-clamp-1 text-(--text-main) mt-0 text-ellipsis font-bold text-[2em] my-[0.67em]"
                        title={product.name}>{product.name}</h1>
                    <p title="Click to copy full license text" class="
                   my-[1em] relative cursor-pointer transition-all duration-300 ease-in-out line-clamp-3 text-sm hover:text-transparent
                   dark:text-gray-500 after:content-[attr(data-content)] after:absolute after:text-transparent after:top-0 after:left-0 after:w-full after:h-full after:flex after:items-center after:justify-center after:rounded-[var(--radius)] after:transition-all after:duration-300 after:ease-in-out
                   hover:after:text-[var(--text-main)] hover:after:bg-[var(--hover-color)]"
                       onclick={(event) => {copyLicense(event, product.code)}}
                       data-content="Copy to clipboard">
                        *********************************************************************************************************************************************************
                    </p>
                </div>
                <div class="transition duration-200 absolute -z-10 w-[88%] h-full bottom-0 rounded-2xl bg-[var(--grey-600)] left-1/2 -translate-x-1/2 group-hover/card:bottom-[-1.5rem]"></div>
                <div class="transition duration-200 absolute -z-10 w-[88%] h-full bottom-0 rounded-2xl bg-[var(--grey-600)] left-1/2 -translate-x-1/2 group-hover/card:bottom-[-2.5rem]"></div>
            </article>
        {/each}
    </main>
    <footer class="pt-10 w-[96%] mt-10 mx-auto pb-10 border-t border-(--border-color) flex items-center justify-between">
        <div class="lt-panel">
            <span class="text-base dark:text-gray-500">All the above keys are collected from the Internet and are for testing purposes only, not for commercial use!</span>
        </div>
        <div class="text-sm dark:text-gray-500">Theme by QieTuZai</div>
    </footer>
</div>

<!-- svelte-ignore css_unused_selector -->
<style lang="postcss">
    :root {
        --text-grey: #9e9e9e;
        --text-main: rgba(0, 0, 0, 0.87);
        --spacing: 4px;
        --size: 64px;
        --radius: 1.5rem;
        --accent: #5380f7;
        --text-sm: 0.875rem;
        --main-bg: #fff;
        --card-bg: #fff;
        --hover-color: #eee;
        --border-color: rgba(0, 0, 0, 0.5);
        --mui-surface: #ffffff;
        --mui-surface-hover: #f8faff;
        --mui-outline: rgba(25, 118, 210, 0.18);
        --mui-outline-strong: rgba(25, 118, 210, 0.5);
        --theme-gradient-start: radial-gradient(circle at top right, rgba(255, 255, 255, 0.98) 0%, rgba(240, 244, 255, 0.94) 26%, rgba(255, 255, 255, 0) 64%);
        --theme-gradient-end: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(245, 248, 255, 0.85) 100%);
        --grey-400: rgba(0, 0, 0, 0.04);
        --grey-600: rgba(0, 0, 0, 0.06);
    }

    .theme-dark {
        --main-bg: rgb(0, 0, 0);
        --card-bg: rgb(31, 34, 38);
        --text-main: #d9d9d9;
        --text-grey: #6e767d;
        --accent: #1d9bf0;
        --hover-color: rgba(255, 255, 255, 0.07);
        --border-color: #4b4648;
        --mui-surface: rgb(31, 34, 38);
        --mui-surface-hover: rgb(40, 44, 49);
        --mui-outline: rgba(29, 155, 240, 0.28);
        --mui-outline-strong: rgba(29, 155, 240, 0.58);
        --theme-gradient-start: radial-gradient(circle at top right, rgba(38, 45, 58, 0.98) 0%, rgba(21, 24, 29, 0.94) 28%, rgba(10, 10, 10, 0) 64%);
        --theme-gradient-end: linear-gradient(135deg, rgba(10, 10, 10, 0.05) 0%, rgba(10, 10, 10, 0.88) 100%);
    }

    #container {
        font-size: 1rem;
        line-height: 1.5;
        word-wrap: break-word;
        font-kerning: normal;
        font-family: 'Gotham SSm A', 'Gotham SSm B', 'Arial Unicode MS', Helvetica, sans-serif;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        background-color: var(--main-bg);
        color: var(--text-main);
        transition: background-color 0.3s ease, color 0.3s ease;
        position: relative;
        isolation: isolate;
    }

    .theme-shell {
        min-height: 100vh;
    }

    .card-header,
    .card-body {
        background-color: var(--card-bg);
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-color);
        border-top-left-radius: var(--radius);
        border-top-right-radius: var(--radius);
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    }

    .card-body {
        border-bottom-left-radius: var(--radius);
        border-bottom-right-radius: var(--radius);
    }

    .header-actions {
        position: relative;
    }

    .theme-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        border-radius: 9999px;
        border: 1px solid var(--mui-outline);
        background: var(--mui-surface);
        color: var(--text-main);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.14);
        transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
        flex-shrink: 0;
    }

    .theme-toggle:hover {
        transform: translateY(-1px);
        background: var(--mui-surface-hover);
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18);
    }

    .theme-toggle:focus-visible {
        outline: none;
        border-color: var(--mui-outline-strong);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent), 0 14px 28px rgba(15, 23, 42, 0.18);
    }

    .theme-toggle-icon {
        width: 1.35rem;
        height: 1.35rem;
    }

    .drawer-toggle:focus-visible {
        outline: none;
        border-color: var(--mui-outline-strong);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .field-label {
        font-size: 0.75rem;
        line-height: 1rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: var(--text-grey);
    }

    .field-input {
        width: 100%;
        border-radius: 12px;
        border: 1px solid var(--mui-outline);
        background: transparent;
        padding: 0.875rem 1rem;
        color: var(--text-main);
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
    }

    .field-input::placeholder {
        color: var(--text-grey);
    }

    .field-input:focus {
        outline: none;
        border-color: var(--mui-outline-strong);
        background: color-mix(in srgb, var(--mui-surface) 92%, var(--accent) 8%);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);
    }
</style>