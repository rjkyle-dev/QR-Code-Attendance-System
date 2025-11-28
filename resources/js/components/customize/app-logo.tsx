import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-24 items-center justify-center rounded-md group-data-[collapsible=icon]:hidden">
                <AppLogoIcon className="text-whie size-24 fill-current dark:text-black" />
            </div>
            <div className="hidden size-8 items-center justify-center rounded-md group-data-[collapsible=icon]:flex">
                <AppLogoIcon />
            </div>
            {/* <div className="ml-1 grid flex-1 text-left text-md">
				<span className="mb-0.5 truncate leading-none font-semibold group-data-[collapsible=icon]:hidden">CheckWise</span>
			</div> */}
        </>
    );
}
