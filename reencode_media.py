import re, base64, io

APP = '/mnt/user-data/outputs/01-JOGO/app.html'
MEDIA = '/home/claude/media-v2'

s = io.open(APP, encoding='utf-8').read()

def b64_of(path, mime):
    data = io.open(path, 'rb').read()
    return f'data:{mime};base64,' + base64.b64encode(data).decode('ascii')

# ---- 1. Fotos das 5 sedes ----
foto_map = {
    1: f'{MEDIA}/foto-sede-nivel-1.jpg',
    2: f'{MEDIA}/foto-sede-nivel-2.jpg',
    3: f'{MEDIA}/foto-sede-nivel-3.jpg',
    4: f'{MEDIA}/foto-sede-nivel-4.jpg',
    5: f'{MEDIA}/foto-sede-nivel-5.jpg',
}
nomes_sede = {
    1: 'O Barraço',
    2: 'Garagem com Oficina',
    3: 'Sede Média',
    4: 'Sede Grande',
    5: 'IMPÉRIO',
}

antes = len(s)
for nivel, path in foto_map.items():
    nome = nomes_sede[nivel]
    novo_b64 = b64_of(path, 'image/jpeg')
    # Acha o bloco daquela sede e substitui só o valor de foto:"...."
    padrao = re.compile(
        r'(nome:"' + re.escape(nome) + r'".*?foto:")data:image/jpeg;base64,[^"]*(")',
        re.DOTALL
    )
    s_novo, n = padrao.subn(lambda m: m.group(1) + novo_b64 + m.group(2), s, count=1)
    if n != 1:
        raise SystemExit(f'ERRO: nao encontrou/substituiu foto da sede {nivel} ({nome}) — n={n}')
    s = s_novo
    print(f'Sede {nivel} ({nome}): foto substituida, novo tamanho b64 = {len(novo_b64)} chars')

# ---- 2. Vídeos dos 3 contratos ----
video_map = {
    'Desmatamento Fazenda Boa Vista': f'{MEDIA}/video-desmatamento.mp4',
    'Extração de Cascalho': f'{MEDIA}/video-cascalho.mp4',
    'Remoção de Entulho de Obra': f'{MEDIA}/video-entulho.mp4',
}
for nome, path in video_map.items():
    novo_b64 = b64_of(path, 'video/mp4')
    padrao = re.compile(
        r'("' + re.escape(nome) + r'": \{\s*url: ")data:video/mp4;base64,[^"]*(")',
        re.DOTALL
    )
    s_novo, n = padrao.subn(lambda m: m.group(1) + novo_b64 + m.group(2), s, count=1)
    if n != 1:
        raise SystemExit(f'ERRO: nao encontrou/substituiu video de "{nome}" — n={n}')
    s = s_novo
    print(f'Video "{nome}": substituido, novo tamanho b64 = {len(novo_b64)} chars')

depois = len(s)
io.open(APP, 'w', encoding='utf-8').write(s)
print(f'\nArquivo salvo. Tamanho antes: {antes} chars, depois: {depois} chars, diferenca: {depois-antes}')
