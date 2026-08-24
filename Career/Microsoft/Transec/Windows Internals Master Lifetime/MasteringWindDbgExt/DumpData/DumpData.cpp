// DumpData.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include "pch.h"

enum class ModuleFlags {
	Loaded = 0,
	Unloaded = 1,
	UserMode = 2,
	Exe = 4,
	Explicit = 8,
	Secondary = 0x10
};
DEFINE_ENUM_FLAG_OPERATORS(ModuleFlags);

enum class SymbolsType {
	None,
	Coff,
	CodeView,
	Pdb,
	Export, Deferred,
	Sym,
	Dia,
};

struct ModuleInfo {
	std::wstring ImageName;
	std::wstring ModuleName;
	std::wstring LoadedImageName;
	std::wstring SymbolFileName;
	std::wstring MappedName;
	ULONGLONG BaseAddress;
	ULONG Size;
	ModuleFlags Flags;
	SymbolsType Symbols;
	ULONG Checksum;
};

#pragma comment(lib, "dbgeng.lib")

int Error(HRESULT hr) {
	printf("Error: 0x%08x\n", hr);
	return 1;
}

std::vector<ModuleInfo> EnumModules(IDebugSymbols3* pSymbols) {
	ULONG loaded, unloaded;
	auto hr = pSymbols->GetNumberModules(&loaded, &unloaded);
	WCHAR name[512];
	std::vector<ModuleInfo> modules;
	modules.reserve(loaded + unloaded);
	DEBUG_MODULE_PARAMETERS mp;
	for (ULONG i = 0; i < loaded + unloaded; i++) {
		if (FAILED(pSymbols->GetModuleParameters(1, nullptr, i, &mp)))
			break;
		ModuleInfo mi;
		mi.Size = mp.Size;
		mi.BaseAddress = mp.Base;
		mi.Flags = static_cast<ModuleFlags>(mp.Flags);
		mi.Symbols = static_cast<SymbolsType>(mp.SymbolType);
		mi.Checksum = mp.Checksum;
		if (S_OK == pSymbols->GetModuleNameStringWide(DEBUG_MODNAME_IMAGE, i, 0, name, _countof(name), nullptr))
			mi.ImageName = name;
		if (S_OK == pSymbols->GetModuleNameStringWide(DEBUG_MODNAME_LOADED_IMAGE, i, 0, name, _countof(name), nullptr))
			mi.LoadedImageName = name;
		if (S_OK == pSymbols->GetModuleNameStringWide(DEBUG_MODNAME_SYMBOL_FILE, i, 0, name, _countof(name), nullptr))
			mi.SymbolFileName = name;
		if (S_OK == pSymbols->GetModuleNameStringWide(DEBUG_MODNAME_MODULE, i, 0, name, _countof(name), nullptr))
			mi.ModuleName = name;
		if (S_OK == pSymbols->GetModuleNameStringWide(DEBUG_MODNAME_MAPPED_IMAGE, i, 0, name, _countof(name), nullptr))
			mi.MappedName = name;

		modules.push_back(std::move(mi));
	}
	return modules;
}

int main(int argc, const char* argv[]) {
	if (argc != 2) {
		printf("Usage: DumpData <dump file>\n");
		return 1;
	}

	CComPtr<IDebugClient4> spClient;
	auto hr = ::DebugCreate(__uuidof(IDebugClient4), (void**)&spClient);
	if (FAILED(hr))
		return Error(hr);

	CComQIPtr<IDebugControl4> spControl(spClient);
	CComQIPtr<IDebugSymbols3> spSymbols(spClient);

	hr = spClient->OpenDumpFile(argv[1]);
	if (FAILED(hr))
		return Error(hr);

	hr = spControl->WaitForEvent(DEBUG_WAIT_DEFAULT, INFINITE);
	if (FAILED(hr))
		return Error(hr);

	ULONG cls, qualifier;
	if (S_OK == spControl->GetDebuggeeType(&cls, &qualifier)) {
		printf("Dump type: %s\n", cls == DEBUG_CLASS_KERNEL ? "Kernel" : "User");
	}

	if (cls == DEBUG_CLASS_KERNEL) {
		for (auto& m : EnumModules(spSymbols)) {
			printf("(%c) Name: %ws Image: %ws Address: 0x%llX Size: 0x%X\n", 
				(m.Flags & ModuleFlags::Unloaded) == ModuleFlags::Unloaded ? 'U' : 'L', 
				m.ModuleName.c_str(), m.ImageName.c_str(), m.BaseAddress, m.Size);
		}
	}

	return 0;
}
