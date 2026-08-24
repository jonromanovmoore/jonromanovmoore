// SimpleExt.cpp : Defines the exported functions for the DLL.
//

#include "pch.h"
#include "SimpleExt.h"
#include <string>

#pragma comment(lib, "dbgeng.lib")

WINDBG_EXTENSION_APIS64 ExtensionApis{ sizeof(ExtensionApis) };

STDAPI DebugExtensionInitialize(PULONG Version, PULONG Flags) {
	CComPtr<IDebugClient4> spClient;
	auto hr = ::DebugCreate(__uuidof(IDebugClient4), (void**)&spClient);
	if (FAILED(hr))
		return hr;
	CComQIPtr<IDebugControl4> spControl(spClient);
	hr = spControl->GetWindbgExtensionApis64(&ExtensionApis);
	if(FAILED(hr))
		return hr;

	*Version = DEBUG_EXTENSION_VERSION(1, 0);
	*Flags = 0;
	return S_OK;
}

STDAPI help(_In_ PDEBUG_CLIENT Client, _In_opt_ PCSTR Args) {
	dprintf("SimpleExt Help\n");
	dprintf("  help - shows this help\n");
	dprintf("  fel - execute commands for each list\n");
	return S_OK;
}

STDAPI fel(_In_ PDEBUG_CLIENT Client, _In_opt_ PCSTR Args) {
	if (Args == nullptr) {
		dprintf("Usage: fel <expression> \"<commands>\"\n");
		return S_OK;
	}
	auto quotes = strchr(Args, '"');
	if(!quotes) {
		dprintf("Usage: fel <expression> \"<commands>\"\n");
		return S_OK;
	}
	auto quotes2 = strrchr(quotes + 1, '"');
	if (!quotes2) {
		dprintf("Usage: fel <expression> \"<commands>\"\n");
		return S_OK;
	}

	std::string commands(quotes + 1, quotes2 - quotes - 1);

	auto value = GetExpression(Args);
	dprintf("Value: 0x%llX\n", value);

	CComQIPtr<IDebugControl> spControl(Client);

	LIST_ENTRY head;
	LIST_ENTRY entry;
	ReadMemory(value, &head, sizeof(head), nullptr);
	ReadMemory((ULONG64)head.Flink, &entry, sizeof(entry), nullptr);
	CComQIPtr<IDebugRegisters2> spRegisters(Client);
	ULONG t1 = 0;
	spRegisters->GetPseudoIndexByName("$t1", &t1);
	dprintf("t1 reg: %d\n", t1);
	dprintf("Commands: %s\n", commands.c_str());

	DEBUG_VALUE dv;
	dv.Type = DEBUG_VALUE_INT64;
	for (; value != (ULONG64)entry.Flink; ReadMemory((ULONG64)entry.Flink, &entry, sizeof(entry), nullptr)) {
		dv.I64 = (ULONG64)entry.Flink;
		auto hr = spRegisters->SetPseudoValues(DEBUG_REGSRC_EXPLICIT, 1, nullptr, t1, &dv);
		ATLASSERT(SUCCEEDED(hr));
		spControl->Execute(DEBUG_OUTCTL_ALL_CLIENTS, commands.c_str(), DEBUG_EXECUTE_DEFAULT);
	}
	return S_OK;
}
